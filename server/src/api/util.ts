import express from "express";
import { prisma } from "../../src/lib/prisma.js";

// ===========================================================================

// Default cursor-functionality page size
export const PAGE_SIZE = 20;

// ===========================================================================

// Make sure the ID is a string and not an empty one or an array of strings
export function validateID(id: unknown) {
  return typeof id === "string" && id.length > 0 && id[0]?.length === 1;
}

// ===========================================================================

// Exactly what it sounds like
export function getBigIntFromString(value: string): bigint | null {
  if (!/^\d+$/.test(value)) return null; // check is unsigned int? (regex)

  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

// ===========================================================================

// Wrapper to reroute to errorhandling middleware
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

// Recursively turns BigInt fields into plain numbers for JSON
export function serializeBigInts(value: unknown): any {
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
export function getBigIntsFromTargetQueries(target: unknown): bigint[] | null {
  if (target === undefined) return [];

  const raw = Array.isArray(target) ? target : [target];
  const ids: bigint[] = [];

  for (const t of raw) {
    const parsed = getBigIntFromString(String(t));
    if (parsed === null) return null;

    ids.push(parsed);
  }

  return ids;
}

// ===========================================================================

// Type mirror of the prisma datastructure
export type StatusMirror =
  | "Success"
  | "Cancelled"
  | "Reported"
  | "Pending"
  | "Ongoing";

// ===========================================================================

// Array of valid mediatypes (matches with prisma schema)
export const MEDIA_TYPES = ["link", "picture", "experience", "group", "asset"];

// ===========================================================================

// Set transaction status iff it's currently in an allowedFrom status
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

  const id = getBigIntFromString(localID as string);
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

  if (
    transaction.clientId !== req.session.userId &&
    transaction.developerId !== req.session.userId
  ) {
    res.status(403).json({
      message: "Forbidden",
    });

    return;
  }

  const updated = await prisma.transaction.update({
    where: { transactionID: id },
    data: { status: to as any, ...extraData },
  });

  res.json(serializeBigInts(updated));
}
