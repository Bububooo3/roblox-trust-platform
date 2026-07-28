import { apiKey, backendDomain } from "../../util/constants";

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { headers = {}, ...init } = options;

  const requestHeaders: Record<string, string> = {
    "x-api-key": apiKey,
    ...headers,
  };

  if (init.body && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`${backendDomain}${path}`, {
    ...init,
    headers: requestHeaders,
    credentials: "include",
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
