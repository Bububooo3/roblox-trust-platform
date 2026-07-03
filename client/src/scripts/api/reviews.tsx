import { apiKey, backendDomain } from "../../util/constants";
import type { jointDataReturn, reviewDataCollection } from "../../util/types";

// VARIABLES
const baseURL = `${backendDomain}/api/reviews`;
const headers = new Headers();
headers.append("x-api-key", apiKey);

// FUNCTIONS
export async function submitReview(
  id: number,
  initData: {
    rating: number;
    description: string;
    reviewerId: number;
  },
): Promise<jointDataReturn | null> {
  try {
    const res = await fetch(`${baseURL}/${id}/reviews`, {
      method: "POST",
      headers,
      body: JSON.stringify(initData),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: jointDataReturn = (await res.json()) as jointDataReturn;
    return data;
  } catch (error) {
    console.log(`Failed to submit reiew: ${(error as Error).message || error}`);
    return null;
  }
}

export async function getReviews(
  ids: number[],
): Promise<reviewDataCollection | null> {
  const targetProxy = ids.map((v, i) => {
    if (i === 0) {
      return `?target=${v}`;
    } else {
      return `&target=${v}`;
    }
  });

  const target = targetProxy.join();

  try {
    const res = await fetch(`${baseURL}${target}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: reviewDataCollection =
      (await res.json()) as reviewDataCollection;
    return data;
  } catch (error) {
    console.log(`Failed to fetch reviews: ${(error as Error).message || error}`);
    return null;
  }
}

export async function editReview(
  id: number,
  editData: { rating: number | null; description: string | null },
) {
  try {
    if (!(editData.rating || editData.description)) {
      throw new Error(`Processing error! No params included!`);
    }

    const res = await fetch(`${baseURL}/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(editData),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: reviewDataCollection =
      (await res.json()) as reviewDataCollection;
    return data;
  } catch (error) {
    console.log(`Failed to fetch reviews: ${(error as Error).message || error}`);
    return null;
  }
}
