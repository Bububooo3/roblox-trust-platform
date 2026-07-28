import { apiFetch } from "./apiClient";
import type { jointDataReturn, reviewData } from "../../util/types";

export async function submitReview(
  transactionId: number,
  initData: {
    rating: number;
    description: string;
    reviewerId: number;
  },
): Promise<jointDataReturn | null> {
  try {
    return await apiFetch<jointDataReturn>(
      `/api/transactions/${transactionId}/reviews`,
      {
        method: "POST",
        body: JSON.stringify(initData),
      },
    );
  } catch (error) {
    console.log(`Failed to submit review: ${(error as Error).message || error}`);
    return null;
  }
}

export async function getReviews(
  ids: number[],
): Promise<reviewData[] | null> {
  if (ids.length === 0) return [];

  const query = ids.map((id) => `target=${id}`).join("&");

  try {
    const data = await apiFetch<reviewData | reviewData[]>(
      `/api/reviews?${query}`,
    );
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.log(`Failed to fetch reviews: ${(error as Error).message || error}`);
    return null;
  }
}

export async function editReview(
  id: number,
  editData: { rating?: number; description?: string },
): Promise<reviewData | null> {
  try {
    return await apiFetch<reviewData>(`/api/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(editData),
    });
  } catch (error) {
    console.log(`Failed to edit review: ${(error as Error).message || error}`);
    return null;
  }
}
