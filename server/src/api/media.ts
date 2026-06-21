import express from "express";
import { prisma } from "../../src/lib/prisma.js";
import {
  getBigIntFromString,
  serializeBigInts,
  MEDIA_TYPES,
  asyncHandler,
  validateID,
} from "./util.js";

// ===========================================================================

// POST .../api/transactions/:id/media
export const newMediaFromTransactionID = // Attach link/pic/asset/experince/group to transaction
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
      const parsedContentID = getBigIntFromString(String(contentID ?? ""));
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
  });

// ===========================================================================

// DELETE .../api/transactions/:id/media/:mediaId
export const deleteMedia = asyncHandler(async (req, res) => {
  const localID1 = req.params.id;
  const localID2 = req.params.mediaId;

  if (
    !(validateID(localID1) && validateID(localID2))
  ) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const transactionId = getBigIntFromString(localID1 as string);
  const mediaId = getBigIntFromString(localID2 as string);

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
});

// ===========================================================================

// GET .../api/transactions/:id/media/:mediaId
export const getMediaFromID = asyncHandler(async (req, res) => {
  const localID1 = req.params.id;
  const localID2 = req.params.mediaId;

  if (
    !(validateID(localID1) && validateID(localID2))
  ) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const transactionId = getBigIntFromString(localID1 as string);
  const mediaId = getBigIntFromString(localID2 as string);

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

  res.json(serializeBigInts(media));
});