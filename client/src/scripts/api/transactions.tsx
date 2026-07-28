import { apiFetch } from "./apiClient";
import type { transactionData } from "../../util/types";

export async function createTransaction(initData: {
  projectName: string;
  amountInCents: number;
  clientId: number;
  developerId: number;
  description: string;
}): Promise<transactionData | null> {
  try {
    return await apiFetch<transactionData>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(initData),
    });
  } catch (error) {
    console.log(
      `Failed to create transaction: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function editTransaction(
  id: number,
  editData: {
    projectName?: string;
    amountInCents?: number;
    description?: string;
    visible?: boolean;
    currency?: string;
  },
): Promise<transactionData | null> {
  try {
    return await apiFetch<transactionData>(`/api/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(editData),
    });
  } catch (error) {
    console.log(
      `Failed to edit transaction: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function setTransactionComplete(
  id: number,
): Promise<transactionData | null> {
  try {
    return await apiFetch<transactionData>(`/api/transactions/${id}/complete`, {
      method: "POST",
    });
  } catch (error) {
    console.log(
      `Failed to complete transaction: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function setTransactionCancelled(
  id: number,
): Promise<transactionData | null> {
  try {
    return await apiFetch<transactionData>(`/api/transactions/${id}/cancel`, {
      method: "POST",
    });
  } catch (error) {
    console.log(
      `Failed to cancel transaction: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function setTransactionAccepted(
  id: number,
): Promise<transactionData | null> {
  try {
    return await apiFetch<transactionData>(`/api/transactions/${id}/accept`, {
      method: "POST",
    });
  } catch (error) {
    console.log(
      `Failed to accept transaction: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function setTransactionReported(
  id: number,
): Promise<transactionData | null> {
  try {
    return await apiFetch<transactionData>(`/api/transactions/${id}/report`, {
      method: "POST",
    });
  } catch (error) {
    console.log(
      `Failed to report transaction: ${(error as Error).message || error}`,
    );
    return null;
  }
}
