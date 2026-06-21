import crypto from "node:crypto";

import express from "express";
import { prisma } from "../../src/lib/prisma.js";
import { asyncHandler } from "./util.js";

// ===========================================================================

// POST .../api-keys
export const generateAPIkey = asyncHandler(async (req, res) => {
  const apiKey = crypto.randomBytes(32).toString("hex");

  const { name } = req.body;

  if (!name) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const application = await prisma.application.create({
    data: {
      name,
      apiKey,
    },
  });

  res.json(application);
});

// ===========================================================================

// DELETE .../api-keys
export const destroyAPIkey = asyncHandler(async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    res.status(400).json({ message: "Bad format" });
    return;
  }

  const key = await prisma.application.findUnique({
    where: {
      apiKey,
    },
  });

  if (!key) {
    res.status(404).json({ message: `API key (${apiKey}) not found` });
    return;
  }

  await prisma.application.delete({
    where: {
      apiKey,
    },
  });

  res.status(204).end();
});
