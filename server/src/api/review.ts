import express from "express";
import { prisma } from "../../src/lib/prisma.js";
import {
  getBigIntFromString,
  serializeBigInts,
  getBigIntsFromTargetQueries,
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

    const transactionId = getBigIntFromString(localID as string);
    if (transactionId === null) {
      res.status(400).json({ message: "Bad format" });
      return;
    }

    const { rating, description, reviewerId } = req.body;
    const parsedReviewerId = getBigIntFromString(String(reviewerId ?? ""));
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

  if (!req.session.userId) {
    res.status(400).json({ message: `No userId specified` });
    return;
  }

    if (
      transaction.clientId !== BigInt(req.session.userId!) &&
      transaction.developerId !== BigInt(req.session.userId!)
    ) {
      res.status(403).json({
        message: `${parsedReviewerId} is not a party to this transaction`,
      });

      return;
    }

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
  const ids = getBigIntsFromTargetQueries(req.query.target);

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

// ===========================================================================

// PATCH .../api/reviews/:id
export const editReview = asyncHandler(async (req, res) => {
  const localID = req.params.id;

  if (!validateID(localID)) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const id = getBigIntFromString(localID as string);
  if (id === null) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const { rating, description } = req.body;
  const data: Record<string, unknown> = {};

  if (rating !== undefined) data.projectName = rating;
  if (description !== undefined) data.description = description;

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "No editable fields provided" });
    return;
  }

  const targetReview = await prisma.review.findUnique({
    where: { reviewID: id },
  });

  if (!targetReview) {
    res.status(404).json({ message: `Review ${req.params.id} not found` });
    return;
  }

  if (
    targetReview.revieweeId !== BigInt(req.session.userId!) &&
    targetReview.reviewerId !== BigInt(req.session.userId!)
  ) {
    res.status(403).json({
      message: `${req.session.userId} is not a party to this transaction`,
    });

    return;
  }

  const updated = await prisma.review.update({
    where: { reviewID: id },
    data,
  });

  res.json(serializeBigInts(updated));
});
