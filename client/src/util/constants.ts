export const backendDomain = import.meta.env.VITE_BACKEND_URL ?? "";
export const frontendDomain =
  import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:5173";
export const apiKey =
  import.meta.env.VITE_API_KEY ??
  "86a2bbea65edbe44cf67790821d1ab30ad7983b7e3f5cadb72cc095bfcd57d80";

export const loginUrl = `${backendDomain}/auth/roblox/login`;
