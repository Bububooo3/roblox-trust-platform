import express from "express";
import cors from "cors";
import { prisma } from "../src/lib/prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

// app.get("/api/health", (_, res) => {
//   res.json({ status: "ok" });
// });

// USER API
app.post("/api/users", async (req, res) => {
  const user = await prisma.user.create({
    data: req.body,
  });

  res.json(user);
});

app.get("/api/users/:id", async (req, res) => {
  const userId = Number(req.params.id);

  if (Number.isNaN(userId)) {
    res.status(400).json({ message: `Bad format` });
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      rblxUserID: userId,
    },
  });

  if (!user) {
    res.status(404).json({ message: `User ${userId} not found` });
  } else {
    res.json({
      ...user,
      id: Number(user.id.toString()), // bc BigInt
    });
  }
});


// TRANSACTION API


// START SERVER
app.listen(3000, () => {
  console.log("API running on port 3000");
});
