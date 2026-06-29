import { apiKey, backendDomain } from "../../util/constants";
import type {
  reviewDataCollection,
  transactionDataCollection,
  userData,
} from "../../util/types";
import notify from "../functionality/notifications";

// VARIABLES
const baseURL = `${backendDomain}/api/users`;
const headers = new Headers();
headers.append("x-api-key", apiKey);

// FUNCTIONS
export async function getUser(id: number): Promise<userData | null> {
  try {
    const res = await fetch(`${baseURL}/${id}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: userData = (await res.json()) as userData;
    return data;
  } catch (error) {
    // console.error("Failed to fetch user:", (error as Error).message || error);
    notify(`Failed to fetch user: ${(error as Error).message || error}`);
    return null;
  }
}

export async function getUserTransactions(
  id: number,
): Promise<transactionDataCollection | null> {
  try {
    const res = await fetch(`${baseURL}/${id}/transactions`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: transactionDataCollection =
      (await res.json()) as transactionDataCollection;
    return data;
  } catch (error) {
    // console.error("Failed to fetch user transaction data:", (error as Error).message || error);
    notify(
      `Failed to fetch user transactions: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function getSelf(): Promise<userData | null> {
  try {
    const res = await fetch(`${baseURL}/self`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: userData = (await res.json()) as userData;
    return data;
  } catch (error) {
    notify(`Failed to fetch user: ${(error as Error).message || error}`);
    return null;
  }
}

export async function getUserReviews(id: number): Promise<reviewDataCollection | null> {
  try {
    const res = await fetch(`${baseURL}/${id}/reviews`, {
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
    notify(
      `Failed to fetch user reviews: ${(error as Error).message || error}`,
    );
    return null;
  }
}
