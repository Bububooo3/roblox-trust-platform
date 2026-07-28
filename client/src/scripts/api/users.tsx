import { apiFetch } from "./apiClient";
import type {
  exploreResponse,
  platformStats,
  reviewDataCollection,
  transactionData,
  transactionDataCollection,
  userData,
} from "../../util/types";

export async function getUser(id: number): Promise<userData | null> {
  try {
    return await apiFetch<userData>(`/api/users/${id}`);
  } catch (error) {
    console.error("Failed to fetch user:", (error as Error).message || error);
    return null;
  }
}

export async function getUserTransactions(
  id: number,
  cursor = 0,
): Promise<transactionDataCollection | null> {
  try {
    return await apiFetch<transactionDataCollection>(
      `/api/users/${id}/transactions?cursor=${cursor}`,
    );
  } catch (error) {
    console.log(
      `Failed to fetch user transactions: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function getSelf(): Promise<userData | null> {
  try {
    return await apiFetch<userData>("/api/users/self");
  } catch {
    return null;
  }
}

export async function getUserReviews(
  id: number,
  cursor = 0,
): Promise<reviewDataCollection | null> {
  try {
    return await apiFetch<reviewDataCollection>(
      `/api/users/${id}/reviews?cursor=${cursor}`,
    );
  } catch (error) {
    console.log(
      `Failed to fetch user reviews: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function getExploreUsers(params: {
  search?: string;
  sort?: string;
  page?: number;
}): Promise<exploreResponse | null> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.sort) query.set("sort", params.sort);
    if (params.page) query.set("page", String(params.page));

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return await apiFetch<exploreResponse>(`/api/explore${suffix}`);
  } catch (error) {
    console.log(`Failed to fetch explore data: ${(error as Error).message}`);
    return null;
  }
}

export async function getPlatformStats(): Promise<platformStats | null> {
  try {
    return await apiFetch<platformStats>("/api/explore/stats");
  } catch {
    return null;
  }
}

export async function getTransaction(id: number): Promise<transactionData | null> {
  try {
    return await apiFetch<transactionData>(`/api/transactions?target=${id}`);
  } catch (error) {
    console.log(
      `Failed to fetch transaction: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function getTransactions(
  ids: number[],
): Promise<transactionData[] | null> {
  if (ids.length === 0) return [];

  const query = ids.map((id) => `target=${id}`).join("&");

  try {
    const data = await apiFetch<transactionData | transactionData[]>(
      `/api/transactions?${query}`,
    );
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.log(
      `Failed to fetch transactions: ${(error as Error).message || error}`,
    );
    return null;
  }
}
