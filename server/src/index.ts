import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import {
  editUser,
  getReviewsFromUserID,
  getTransactionsFromUserID,
  getUserFromID,
  newUser,
} from "./api/user.js";
import {
  acceptTransaction,
  cancelTransaction,
  completeTransaction,
  editTransaction,
  getTransactionsFromTargetQuery,
  newTransaction,
  reportTransaction,
} from "./api/transaction.js";
import {
  editReview,
  getReviewsFromTargetQuery,
  newReview,
} from "./api/review.js";
import {
  deleteMedia,
  getMediaFromID,
  newMediaFromTransactionID,
} from "./api/media.js";
import { destroyAPIkey, generateAPIkey } from "./api/key.js";
import { authAPIkey } from "./middleware/auth.js";

// ===========================================================================

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authAPIkey);
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    max: 100,
  }),
);

// ===========================================================================

// HEALTH CHECK API
app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

// ===========================================================================

// USER API
app.post("/api/users", newUser);
app.get("/api/users/:id", getUserFromID);
app.get("/api/users/:id/transactions", getTransactionsFromUserID);
app.get("/api/users/:id/reviews", getReviewsFromUserID);
app.patch("/api/users/:id", editUser);

// ===========================================================================

// TRANSACTION API
app.get("/api/transactions", getTransactionsFromTargetQuery);
app.post("/api/transactions", newTransaction);
app.patch("/api/transactions/:id", editTransaction);
app.post("/api/transactions/:id/accept", acceptTransaction);
app.post("/api/transactions/:id/complete", completeTransaction);
app.post("/api/transactions/:id/cancel", cancelTransaction);
app.post("/api/transactions/:id/report", reportTransaction);

// ===========================================================================

// REVIEW API
app.post("/api/transactions/:id/reviews", newReview);
app.get("/api/reviews", getReviewsFromTargetQuery);
app.patch("/api/reviews/:id", editReview);

// ===========================================================================

// MEDIA API
app.post("/api/transactions/:id/media", newMediaFromTransactionID);
app.delete("/api/transactions/:id/media/:mediaId", deleteMedia);
app.get("/api/transactions/:id/media/:mediaId", getMediaFromID);

// ==========================================================================

// ACCESS KEY API
app.post("/api/keys", generateAPIkey);
app.delete("/api/keys", destroyAPIkey);

// ==========================================================================

// ERROR HANDLING
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  },
);

// ===========================================================================

// DEV SERVER
app.listen(3000, () => {
  console.log("API running on port 3000");
});
