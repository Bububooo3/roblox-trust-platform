import "express-session";

// ===========================================================================
declare module "express-session" {
  interface SessionData {
    userId?: bigint;
    oauthState?: string;
  }
}

// ===========================================================================

// Extend express type for API key
declare global {
  namespace Express {
    interface Request {
      application?: {
        id: string;
        name: string;
      };
    }
  }
}