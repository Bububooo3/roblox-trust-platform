import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import {
  // editUser,
  getReviewsFromUserID,
  getTransactionsFromUserID,
  getUserFromID,
  // newUser,
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
import { authAPIkey, authUser } from "./middleware/auth.js";
import { robloxLoginEnter, robloxLoginReturn } from "./middleware/roblox.js";

// ===========================================================================

// SETUP
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

app.use(
  "/api-keys",
  rateLimit({
    windowMs: 60_000,
    max: 100,
  }),
);

// ===========================================================================

// SESSION PROTECTION
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // (a week)
    },
  }),
);

// ===========================================================================

// ROBLOX SSO SENDOFF
app.get("/auth/roblox/login", robloxLoginEnter);

// ===========================================================================

// ROBLOX SSO RECEPTION
app.get("/auth/roblox/return", robloxLoginReturn);
// ===========================================================================

// HEALTH CHECK API
app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

// ===========================================================================

// USER API
// app.post("/api/users", newUser);
app.get("/api/users/:id", getUserFromID);
app.get("/api/users/:id/transactions", getTransactionsFromUserID);
app.get("/api/users/:id/reviews", getReviewsFromUserID);
// app.patch("/api/users/:id", editUser);

// ===========================================================================

// TRANSACTION API
app.get("/api/transactions", getTransactionsFromTargetQuery);
app.post("/api/transactions", authUser, newTransaction);
app.patch("/api/transactions/:id", authUser, editTransaction);
app.post("/api/transactions/:id/accept", authUser, acceptTransaction);
app.post("/api/transactions/:id/complete", authUser, completeTransaction);
app.post("/api/transactions/:id/cancel", authUser, cancelTransaction);
app.post("/api/transactions/:id/report", authUser, reportTransaction);

// ===========================================================================

// REVIEW API
app.post("/api/transactions/:id/reviews", authUser, newReview);
app.get("/api/reviews", getReviewsFromTargetQuery);
app.patch("/api/reviews/:id", authUser, editReview);

// ===========================================================================

// MEDIA API
app.post("/api/transactions/:id/media", authUser, newMediaFromTransactionID);
app.delete("/api/transactions/:id/media/:mediaId", authUser, deleteMedia);
app.get("/api/transactions/:id/media/:mediaId", getMediaFromID);

// ==========================================================================

// ACCESS KEY API
app.post("/api-keys", generateAPIkey);
app.delete("/api-keys", authAPIkey, destroyAPIkey);

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
app.listen(Number(process.env.BACKEND_PORT), () => {
  console.log(`API running on port ${process.env.BACKEND_PORT}`);
});
