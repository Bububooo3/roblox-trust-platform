export const backendDomain = import.meta.env.VITE_BACKEND_URL ?? "";
export const frontendDomain =
  import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:5173";
export const apiKey =
  import.meta.env.VITE_API_KEY ??
  "";

export const loginUrl = `${backendDomain}/auth/roblox/login`;
