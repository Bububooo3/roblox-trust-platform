import express from "express";
import { prisma } from "../../src/lib/prisma.js";

// ===========================================================================

export const PAGE_SIZE = 20;

// ===========================================================================

// Gets whether the ID is valid
export function validateID(id: unknown) {
  return typeof id === "string" && id.length > 0 && id[0]?.length === 1;
}

// ===========================================================================

// Parses a route/query param into a BigInt, or null if malformed.
// Going string -> BigInt directly (rather than through Number) avoids
// precision loss for IDs above Number.MAX_SAFE_INTEGER.
export function parseBigIntParam(value: string): bigint | null {
  if (!/^\d+$/.test(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

// ===========================================================================

// Wraps an async handler so thrown/rejected errors reach the error
// middleware instead of becoming unhandled rejections.
export function asyncHandler(
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

// ===========================================================================

// Recursively turns BigInt fields into plain numbers so the response can
// be JSON-serialized (res.json() throws on a raw BigInt).
export function serializeBigInts<T>(value: T): any {
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

// ===========================================================================

// Parses ?target=&target=... (repeated key = array, single key = string)
// into a list of BigInts. Returns null if any entry is malformed.
export function parseTargetList(target: unknown): bigint[] | null {
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

// ===========================================================================

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

export const MEDIA_TYPES: MediaTypeMirror[] = [
  "link",
  "picture",
  "experience",
  "group",
  "asset",
];

// ===========================================================================

// Moves a transaction from one of `allowedFrom` statuses to `to`.
// 404 if the transaction doesn't exist, 409 if it's not in a status this
// action can run from, otherwise 200 with the updated transaction.
export async function setTransactionStatus(
  req: express.Request,
  res: express.Response,
  allowedFrom: StatusMirror[],
  to: StatusMirror,
  extraData: Record<string, unknown> = {},
) {
  const localID = req.params.id;

  if (!validateID(localID)) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const id = parseBigIntParam(localID as string);
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
