import { prisma } from "../../src/lib/prisma.js";
import {
  serializeBigInts,
  PAGE_SIZE,
  asyncHandler,
  validateID,
  getBigIntFromString,
} from "./util.js";

type ExploreSort = "relevance" | "username" | "rating" | "transactions" | "volume";

async function enrichUser(user: {
  id: bigint;
  rblxUserID: bigint;
  robloxUsername: string;
  productAccountAge: number;
  robloxAccountAge: number;
  lastLogin: Date;
  productAccountCreationDate: Date;
}) {
  const [transactions, reviews] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        OR: [{ clientId: user.rblxUserID }, { developerId: user.rblxUserID }],
        visible: true,
      },
      select: { amountInCents: true },
    }),
    prisma.review.findMany({
      where: { revieweeId: user.rblxUserID },
      select: { rating: true },
    }),
  ]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  const volume = transactions.reduce(
    (sum, transaction) => sum + transaction.amountInCents,
    0,
  );

  return {
    ...serializeBigInts(user),
    averageRating,
    transactionCount: transactions.length,
    volume,
  };
}

function sortEntries<T extends { robloxUsername: string; averageRating: number | null; transactionCount: number; volume: number }>(
  entries: T[],
  sort: ExploreSort,
): T[] {
  const sorted = [...entries];

  switch (sort) {
    case "username":
      return sorted.sort((a, b) =>
        a.robloxUsername.localeCompare(b.robloxUsername),
      );
    case "rating":
      return sorted.sort(
        (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
      );
    case "transactions":
      return sorted.sort((a, b) => b.transactionCount - a.transactionCount);
    case "volume":
      return sorted.sort((a, b) => b.volume - a.volume);
    default:
      return sorted;
  }
}

export const exploreStats = asyncHandler(async (_req, res) => {
  const [userCount, transactionCount] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
  ]);

  res.json({ userCount, transactionCount });
});

export const exploreUsers = asyncHandler(async (req, res) => {
  const search = String(req.query.search ?? "").trim();
  const sort = (String(req.query.sort ?? "relevance") as ExploreSort) || "relevance";
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);

  const where =
    search.length > 0
      ? {
          OR: [
            { robloxUsername: { contains: search, mode: "insensitive" as const } },
            ...(validateID(search) && getBigIntFromString(search)
              ? [{ rblxUserID: getBigIntFromString(search)! }]
              : []),
          ],
        }
      : undefined;

  const users = await prisma.user.findMany({ where });
  const enriched = await Promise.all(users.map((user) => enrichUser(user)));
  const sorted = sortEntries(enriched, sort);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const data = sorted.slice(start, start + PAGE_SIZE);

  res.json({
    data,
    page: safePage,
    totalPages,
    total,
  });
});
