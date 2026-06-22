import { prisma } from "../lib/prisma.js";

// GET .../auth/roblox/login
export const robloxLoginEnter = (req: any, res: any) => {
  const state = crypto.randomUUID();

  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: process.env.ROBLOX_CLIENT_ID!,
    redirect_uri: process.env.ROBLOX_REDIRECT_URI!,
    response_type: "code",
    scope: "openid profile",
    state,
  });

  res.redirect(`https://apis.roblox.com/oauth/v1/authorize?${params}`);
};

// ===========================================================================

// GET .../auth/roblox/return
export const robloxLoginReturn = async (req: any, res: any) => {
  const { code, state } = req.query;

  if (state !== req.session.oauthState) {
    return res.status(400).send("Invalid state"); // bad state
  }

  // Exchange code for token
  const tokenResponse = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: String(code),
      client_id: process.env.ROBLOX_CLIENT_ID!,
      client_secret: process.env.ROBLOX_CLIENT_SECRET!,
      redirect_uri: process.env.ROBLOX_REDIRECT_URI!,
    }),
  });

  const tokens = await tokenResponse.json();

  // Get User Info
  const profileResponse = await fetch(
    "https://apis.roblox.com/oauth/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    },
  );

  const userInfo = await profileResponse.json();

  // Create/update database user
  const rblxUserID = BigInt(userInfo.sub);

  const user = await prisma.user.upsert({
    where: { rblxUserID },

    update: {
      robloxUsername: userInfo.preferred_username,
      lastLogin: new Date(),
    },

    create: {
      rblxUserID,
      robloxUsername: userInfo.preferred_username,
      productAccountAge: 0,
      robloxAccountAge: Math.abs(Math.floor(Date.now()/1000) - userInfo.created_at),
    },
  });

  // Save user ID in session
  req.session.userId = user.rblxUserID;

  res.redirect(process.env.FRONTEND_URL!);
};
