import express from "express";
import { prisma } from "../../src/lib/prisma.js";
import {
  getBigIntFromString,
  serializeBigInts,
  getBigIntsFromTargetQueries,
  setTransactionStatus,
  asyncHandler,
  validateID,
} from "./util.js";

// ===========================================================================

// GET .../api/transactions?target={}
export const getTransactionsFromTargetQuery = asyncHandler(async (req, res) => {
  const ids = getBigIntsFromTargetQueries(req.query.target);

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
    ids.length === 1 ? serializeBigInts(ordered[0]) : serializeBigInts(ordered),
  );
});

// ===========================================================================

// POST .../api/transactions
export const newTransaction = asyncHandler(async (req, res) => {
  const { projectName, amountInCents, clientId, developerId, description } =
    req.body;

  const parsedClientId = getBigIntFromString(clientId);
  const parsedDeveloperId = getBigIntFromString(developerId);

  if (!parsedClientId || !parsedDeveloperId) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  if (
    parsedClientId !== req.session.userId &&
    parsedDeveloperId !== req.session.userId
  ) {
    res.status(403).json({
      message: "Forbidden",
    });

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
});

// ===========================================================================

// PATCH .../api/transactions/:id
export const editTransaction = asyncHandler(async (req, res) => {
  const localID = req.params.id;
  const { userID } = req.body;

  if (!validateID(localID)) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const id = getBigIntFromString(localID as string);
  if (id === null) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const { projectName, description, amountInCents, currency, visible } =
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

  const targetTransaction = await prisma.transaction.findUnique({
    where: { transactionID: id },
  });

  if (!targetTransaction) {
    res.status(404).json({ message: `Transaction ${localID} not found` });
    return;
  }

  if (
    targetTransaction.clientId !== req.session.userId &&
    targetTransaction.developerId !== req.session.userId
  ) {
    res.status(403).json({
      message: "Forbidden",
    });

    return;
  }

  const updated = await prisma.transaction.update({
    where: { transactionID: id },
    data,
  });

  res.json(serializeBigInts(updated));
});

// ===========================================================================

// POST .../api/transactions/:id/accept
export const acceptTransaction = // Developer accepts a pending job
  asyncHandler(async (req, res) => {
    await setTransactionStatus(req, res, ["Pending"], "Ongoing");
  });

// ===========================================================================

// POST .../api/transactions/:id/complete
export const completeTransaction = // The job is finished
  asyncHandler(async (req, res) => {
    await setTransactionStatus(req, res, ["Ongoing"], "Success", {
      completedAt: new Date(),
    });
  });

// ===========================================================================

// POST .../api/transactions/:id/cancel
export const cancelTransaction = // Either party backs out before the job's done
  asyncHandler(async (req, res) => {
    await setTransactionStatus(req, res, ["Pending", "Ongoing"], "Cancelled");
  });

// ===========================================================================

// POST .../api/transactions/:id/report
export const reportTransaction = // Flag a dispute, allowed even after job's done
  asyncHandler(async (req, res) => {
    await setTransactionStatus(
      req,
      res,
      ["Pending", "Ongoing", "Success"],
      "Reported",
    );
  });
