import express from "express";
import { prisma } from "../../src/lib/prisma.js";
import {
  parseBigIntParam,
  serializeBigInts,
  PAGE_SIZE,
  asyncHandler,
  validateID,
} from "./util.js";

// ===========================================================================

// POST .../api/users
export const newUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.create({
    data: req.body,
  });

  res.json(serializeBigInts(user));
});

// ===========================================================================

// GET .../api/users/:id
export const getUserFromID = asyncHandler(async (req, res) => {
  const localID = req.params.id;

  if (!validateID(req.params.id)) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const rblxUserID = parseBigIntParam(localID as string);

  if (rblxUserID === null) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { rblxUserID },
  });

  if (!user) {
    res.status(404).json({ message: `User ${req.params.id} not found` });
    return;
  }

  res.json(serializeBigInts(user));
});

// ===========================================================================

// GET .../api/users/:id/transactions?cursor={}
export const getTransactionsFromUserID = // Excludes cursor from result if it is specified
  asyncHandler(async (req, res) => {
    const localID = req.params.id;

    if (!validateID(localID)) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const rblxUserID = parseBigIntParam(localID as string);
    if (rblxUserID === null) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const param = req.query.cursor;
    const cursor = param === undefined ? 0n : parseBigIntParam(String(param));

    if (cursor === null) {
      res.status(400).json({ message: "Bad cursor format" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { rblxUserID } });
    if (!user) {
      res.status(404).json({ message: `User ${req.params.id} not found` });
      return;
    }

    // TODO slower on large-scale so should eventually be replaced w/ raw SQL
    const transactions = await prisma.transaction.findMany({
      where: {
        transactionID: { gt: cursor },
        OR: [{ clientId: rblxUserID }, { developerId: rblxUserID }],
      },
      orderBy: { transactionID: "asc" },
      take: PAGE_SIZE,
    });

    const nextCursor =
      transactions.length === PAGE_SIZE
        ? transactions[transactions.length - 1]!.transactionID
        : null;

    res.json({
      data: serializeBigInts(transactions),
      nextCursor: nextCursor === null ? null : Number(nextCursor),
    });
  });

// ===========================================================================

// GET .../api/users/:id/reviews?cursor={}
export const getReviewsFromUserID = // (Reviews ABOUT the user)
  asyncHandler(async (req, res) => {
    const localID = req.params.id;

    if (
      !(
        typeof localID === "string" &&
        localID.length > 0 &&
        localID[1]?.length === 1
      )
    ) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const rblxUserID = parseBigIntParam(localID);
    if (rblxUserID === null) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const cursorParam = req.query.cursor;
    const cursor =
      cursorParam === undefined ? 0n : parseBigIntParam(String(cursorParam));
    if (cursor === null) {
      res.status(400).json({ message: "Bad cursor format" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { rblxUserID } });
    if (!user) {
      res.status(404).json({ message: `User ${req.params.id} not found` });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: {
        reviewID: { gt: cursor },
        revieweeId: rblxUserID,
      },
      orderBy: { reviewID: "asc" },
      take: PAGE_SIZE,
    });

    const nextCursor =
      reviews.length === PAGE_SIZE
        ? reviews[reviews.length - 1]!.reviewID
        : null;

    res.json({
      data: serializeBigInts(reviews),
      nextCursor: nextCursor === null ? null : Number(nextCursor),
    });
  });
