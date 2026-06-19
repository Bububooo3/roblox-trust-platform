import express from "express";
import { prisma } from "../../src/lib/prisma.js";
import {
  parseBigIntParam,
  serializeBigInts,
  parseTargetList,
  MEDIA_TYPES,
  transitionTransaction,
  PAGE_SIZE,
  asyncHandler,
  validateID,
} from "./util.js";

// ===========================================================================

// POST .../api/transactions/:id/reviews
export const newReview = // client/dev on a completed transaction reviews other party
  asyncHandler(async (req, res) => {
    const localID = req.params.id;

    if (!validateID(localID)) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const transactionId = parseBigIntParam(localID as string);
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
      res.status(403).json({
        message: `${parsedReviewerId} is not a party to this transaction`,
      });
      return;
    }

    if (transaction[slot] !== null) {
      res.status(409).json({
        message: ` ${parsedReviewerId} has already reviewed this transaction`,
      });
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
  });

// ===========================================================================

// GET .../api/reviews?target={}
export const getReviewsFromTargetQuery = asyncHandler(async (req, res) => {
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
    ids.length === 1 ? serializeBigInts(ordered[0]) : serializeBigInts(ordered),
  );
});
