import express from "express";
import { prisma } from "../src/lib/prisma.js";
import cors from "cors";
import {
  getReviewsFromUserID,
  getTransactionsFromUserID,
  getUserFromID,
  newUser,
} from "./api/user.js";

const app = express();

app.use(cors());
app.use(express.json());

const PAGE_SIZE = 20;

// Helpers

// Parses a route/query param into a BigInt, or null if malformed.
// Going string -> BigInt directly (rather than through Number) avoids
// precision loss for IDs above Number.MAX_SAFE_INTEGER.
function parseBigIntParam(value: string): bigint | null {
  if (!/^\d+$/.test(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

// Recursively turns BigInt fields into plain numbers so the response can
// be JSON-serialized (res.json() throws on a raw BigInt).
function serializeBigInts<T>(value: T): any {
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(serializeBigInts);
  if (value !== null && typeof value === "object") {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serializeBigInts(val);
    }
    return result;
  }
  return value;
}

// Wraps an async handler so thrown/rejected errors reach the error
// middleware instead of becoming unhandled rejections.
function asyncHandler(
  fn: (req: express.Request, res: express.Response) => Promise<void>,
) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    fn(req, res).catch(next);
  };
}

// Parses ?target=&target=... (repeated key = array, single key = string)
// into a list of BigInts. Returns null if any entry is malformed.
function parseTargetList(target: unknown): bigint[] | null {
  if (target === undefined) return [];
  const raw = Array.isArray(target) ? target : [target];
  const ids: bigint[] = [];
  for (const t of raw) {
    const parsed = parseBigIntParam(String(t));
    if (parsed === null) return null;
    ids.push(parsed);
  }
  return ids;
}

// Mirrors the Status enum in schema.prisma. Kept as a local literal union
// (instead of importing the generated enum) since the "prisma-client"
// generator's export shape can vary by version — `as any` casts below
// bridge the gap when these values flow into Prisma's typed `data`.
type StatusMirror =
  | "Success"
  | "Cancelled"
  | "Reported"
  | "Pending"
  | "Ongoing";

// Mirrors the MediaType enum, same reasoning.
type MediaTypeMirror = "link" | "picture" | "experience" | "group" | "asset";
const MEDIA_TYPES: MediaTypeMirror[] = [
  "link",
  "picture",
  "experience",
  "group",
  "asset",
];

// Moves a transaction from one of `allowedFrom` statuses to `to`.
// 404 if the transaction doesn't exist, 409 if it's not in a status this
// action can run from, otherwise 200 with the updated transaction.
async function transitionTransaction(
  req: express.Request,
  res: express.Response,
  allowedFrom: StatusMirror[],
  to: StatusMirror,
  extraData: Record<string, unknown> = {},
) {
  const localID = req.params.id;

  if (
    !(
      typeof localID === "string" &&
      localID.length > 0 &&
      localID[0]?.length === 1
    )
  ) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const id = parseBigIntParam(localID);
  if (id === null) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const transaction = await prisma.transaction.findUnique({
    where: { transactionID: id },
  });
  if (!transaction) {
    res.status(404).json({ message: `Transaction ${req.params.id} not found` });
    return;
  }

  if (!allowedFrom.includes(transaction.status as StatusMirror)) {
    res.status(409).json({
      message: `Cannot move transaction from ${transaction.status} to ${to}`,
    });
    return;
  }

  const updated = await prisma.transaction.update({
    where: { transactionID: id },
    data: { status: to as any, ...extraData },
  });

  res.json(serializeBigInts(updated));
}

// app.get("/api/health", (_, res) => {
//   res.json({ status: "ok" });
// });

// USER API
app.post("/api/users", newUser);
app.get("/api/users/:id", getUserFromID);
app.get("/api/users/:id/transactions", getTransactionsFromUserID);
app.get("/api/users/:id/reviews", getReviewsFromUserID);

// TRANSACTION API
// GET /api/transactions?target={id}  (repeat target= for multiple)
app.get(
  "/api/transactions",
  asyncHandler(async (req, res) => {
    const ids = parseTargetList(req.query.target);

    if (ids === null) {
      res.status(400).json({ message: "Bad format" });
      return;
    }
    if (ids.length === 0) {
      res.status(400).json({ message: "Missing target query parameter" });
      return;
    }

    const transactions = await prisma.transaction.findMany({
      where: { transactionID: { in: ids } },
    });

    if (transactions.length !== ids.length) {
      res.status(404).json({ message: "One or more transactions not found" });
      return;
    }

    const byId = new Map(
      transactions.map((t) => [t.transactionID.toString(), t]),
    );
    const ordered = ids.map((id) => byId.get(id.toString())!);

    res.json(
      ids.length === 1
        ? serializeBigInts(ordered[0])
        : serializeBigInts(ordered),
    );
  }),
);

app.post(
  "/api/transactions",
  asyncHandler(async (req, res) => {
    const { projectName, amountInCents, clientId, developerId, description } =
      req.body;

    const parsedClientId = parseBigIntParam(clientId);
    const parsedDeveloperId = parseBigIntParam(developerId);

    if (!parsedClientId || !parsedDeveloperId) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const [client, developer] = await Promise.all([
      prisma.user.findUnique({
        where: { rblxUserID: parsedClientId },
      }),
      prisma.user.findUnique({
        where: { rblxUserID: parsedDeveloperId },
      }),
    ]);

    if (!client || !developer) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        projectName,
        amountInCents,
        clientId: parsedClientId,
        developerId: parsedDeveloperId,
        description,
        status: "Pending",
        visible: true,
      },
    });

    res.status(201).json(serializeBigInts(transaction));
  }),
);

// PATCH /api/transactions/:id — whitelisted partial edit.
// Status moves through the dedicated accept/complete/cancel/report actions
// below instead of being editable here.
app.patch(
  "/api/transactions/:id",
  asyncHandler(async (req, res) => {
    const localID = req.params.id;

    if (
      !(
        typeof localID === "string" &&
        localID.length > 0 &&
        localID[0]?.length === 1
      )
    ) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const id = parseBigIntParam(localID);
    if (id === null) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const { projectName, amountInCents, description, currency, visible } =
      req.body;
    const data: Record<string, unknown> = {};
    if (projectName !== undefined) data.projectName = projectName;
    if (amountInCents !== undefined) data.amountInCents = amountInCents;
    if (description !== undefined) data.description = description;
    if (currency !== undefined) data.currency = currency;
    if (visible !== undefined) data.visible = visible;

    if (Object.keys(data).length === 0) {
      res.status(400).json({ message: "No editable fields provided" });
      return;
    }

    const existing = await prisma.transaction.findUnique({
      where: { transactionID: id },
    });
    if (!existing) {
      res
        .status(404)
        .json({ message: `Transaction ${req.params.id} not found` });
      return;
    }

    const updated = await prisma.transaction.update({
      where: { transactionID: id },
      data,
    });

    res.json(serializeBigInts(updated));
  }),
);

// POST /api/transactions/:id/accept — developer accepts a pending job
app.post(
  "/api/transactions/:id/accept",
  asyncHandler(async (req, res) => {
    await transitionTransaction(req, res, ["Pending"], "Ongoing");
  }),
);

// POST /api/transactions/:id/complete — job is finished
app.post(
  "/api/transactions/:id/complete",
  asyncHandler(async (req, res) => {
    await transitionTransaction(req, res, ["Ongoing"], "Success", {
      completedAt: new Date(),
    });
  }),
);

// POST /api/transactions/:id/cancel — either party backs out before completion
app.post(
  "/api/transactions/:id/cancel",
  asyncHandler(async (req, res) => {
    await transitionTransaction(req, res, ["Pending", "Ongoing"], "Cancelled");
  }),
);

// POST /api/transactions/:id/report — flag a dispute, allowed even after
// the job is marked complete
app.post(
  "/api/transactions/:id/report",
  asyncHandler(async (req, res) => {
    await transitionTransaction(
      req,
      res,
      ["Pending", "Ongoing", "Success"],
      "Reported",
    );
  }),
);

// REVIEW API

// POST /api/transactions/:id/reviews — the client or developer on a
// completed transaction leaves a review for the other party.
app.post(
  "/api/transactions/:id/reviews",
  asyncHandler(async (req, res) => {
    const localID = req.params.id;

    if (
      !(
        typeof localID === "string" &&
        localID.length > 0 &&
        localID[0]?.length === 1
      )
    ) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const transactionId = parseBigIntParam(localID);
    if (transactionId === null) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const { rating, description, reviewerId } = req.body;
    const parsedReviewerId = parseBigIntParam(String(reviewerId ?? ""));
    if (parsedReviewerId === null) {
      res.status(400).json({ message: "Invalid reviewerId" });
      return;
    }

    const transaction = await prisma.transaction.findUnique({
      where: { transactionID: transactionId },
    });
    if (!transaction) {
      res
        .status(404)
        .json({ message: `Transaction ${req.params.id} not found` });
      return;
    }

    if (transaction.status !== "Success") {
      res.status(409).json({
        message: "Reviews can only be left on completed transactions",
      });
      return;
    }

    let revieweeId: bigint;
    let slot: "clientReviewId" | "developerReviewId";

    if (parsedReviewerId === transaction.clientId) {
      revieweeId = transaction.developerId;
      slot = "clientReviewId"; // client reviews developer
    } else if (parsedReviewerId === transaction.developerId) {
      revieweeId = transaction.clientId;
      slot = "developerReviewId"; // developer reviews client
    } else {
      res
        .status(403)
        .json({ message: "reviewerId is not a party to this transaction" });
      return;
    }

    if (transaction[slot] !== null) {
      res
        .status(409)
        .json({ message: "This party has already reviewed this transaction" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        rating,
        description,
        reviewerId: parsedReviewerId,
        revieweeId,
        linkedTransactionId: transactionId,
      },
    });

    const updated = await prisma.transaction.update({
      where: { transactionID: transactionId },
      data: { [slot]: review.reviewID },
    });

    res.status(201).json(serializeBigInts({ review, transaction: updated }));
  }),
);

// GET /api/reviews?target={id}  (repeat target= for multiple)
app.get(
  "/api/reviews",
  asyncHandler(async (req, res) => {
    const ids = parseTargetList(req.query.target);

    if (ids === null) {
      res.status(400).json({ message: "Bad format" });
      return;
    }
    if (ids.length === 0) {
      res.status(400).json({ message: "Missing target query parameter" });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { reviewID: { in: ids } },
    });

    if (reviews.length !== ids.length) {
      res.status(404).json({ message: "One or more reviews not found" });
      return;
    }

    const byId = new Map(reviews.map((r) => [r.reviewID.toString(), r]));
    const ordered = ids.map((id) => byId.get(id.toString())!);

    res.json(
      ids.length === 1
        ? serializeBigInts(ordered[0])
        : serializeBigInts(ordered),
    );
  }),
);

// MEDIA API

// POST /api/transactions/:id/media — attach a media reference (link, image,
// or Roblox asset/experience/group ID) to a transaction
app.post(
  "/api/transactions/:id/media",
  asyncHandler(async (req, res) => {
    const localID = req.params.id;

    if (
      !(
        typeof localID === "string" &&
        localID.length > 0 &&
        localID[0]?.length === 1
      )
    ) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const transactionId = parseBigIntParam(localID);
    if (transactionId === null) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const transaction = await prisma.transaction.findUnique({
      where: { transactionID: transactionId },
    });
    if (!transaction) {
      res
        .status(404)
        .json({ message: `Transaction ${req.params.id} not found` });
      return;
    }

    const { type, contentID, contentString } = req.body;
    if (!MEDIA_TYPES.includes(type)) {
      res
        .status(400)
        .json({ message: `type must be one of ${MEDIA_TYPES.join(", ")}` });
      return;
    }

    const data: Record<string, unknown> = {
      type: type as any,
      linkedTransactionId: transactionId,
    };

    if (type === "link") {
      if (typeof contentString !== "string" || contentString.length === 0) {
        res
          .status(400)
          .json({ message: "contentString is required for link media" });
        return;
      }
      data.contentString = contentString;
    } else {
      const parsedContentID = parseBigIntParam(String(contentID ?? ""));
      if (parsedContentID === null) {
        res
          .status(400)
          .json({ message: "contentID is required for this media type" });
        return;
      }
      data.contentID = parsedContentID;
    }

    const media = await prisma.media.create({ data: data as any });

    res.status(201).json(serializeBigInts(media));
  }),
);

// DELETE /api/transactions/:id/media/:mediaId
app.delete(
  "/api/transactions/:id/media/:mediaId",
  asyncHandler(async (req, res) => {
    const localID1 = req.params.id;

    if (
      !(
        typeof localID1 === "string" &&
        localID1.length > 0 &&
        localID1[0]?.length === 1
      )
    ) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const localID2 = req.params.id;

    if (
      !(
        typeof localID2 === "string" &&
        localID2.length > 0 &&
        localID2[0]?.length === 1
      )
    ) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const transactionId = parseBigIntParam(localID1);
    const mediaId = parseBigIntParam(localID2);

    if (transactionId === null || mediaId === null) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const media = await prisma.media.findUnique({ where: { mediaId } });

    if (!media || media.linkedTransactionId !== transactionId) {
      res.status(404).json({
        message: `Media ${req.params.mediaId} not found on transaction ${req.params.id}`,
      });
      return;
    }

    await prisma.media.delete({ where: { mediaId } });

    res.status(204).end();
  }),
);

// Catches anything asyncHandler forwarded via next(err)
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  },
);

// START SERVER
app.listen(3000, () => {
  console.log("API running on port 3000");
});
