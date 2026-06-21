import express from "express";
import { prisma } from "../lib/prisma.js";

export async function authAPIkey(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const apiKey = req.header("X-API-KEY");

  if (!apiKey) {
    res.status(401).json({ message: "Missing API key" });
    return;
  }

  const application = await prisma.application.findUnique({
    where: { apiKey },
  });

  if (!application || !application.active) {
    res.status(401).json({ message: "Invalid API key" });
    return;
  }

  req.application = application;

  next();
}
