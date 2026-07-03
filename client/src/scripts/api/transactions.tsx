import { apiKey, backendDomain } from "../../util/constants";
import type {
  transactionData,
  transactionDataCollection,
} from "../../util/types";

// VARIABLES
const baseURL = `${backendDomain}/api/transactions`;
const headers = new Headers();
headers.append("x-api-key", apiKey);

// FUNCTIONS
export async function getTransactions(
  ids: number[],
): Promise<transactionDataCollection | null> {
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

    const data: transactionDataCollection =
      (await res.json()) as transactionDataCollection;
    return data;
  } catch (error) {
    console.log(
      `Failed to fetch transactions: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function createTransaction(initData: {
  projectName: string;
  amountInCents: number;
  clientId: number;
  developerId: number;
  description: string;
}): Promise<transactionData | null> {
  try {
    const res = await fetch(`${baseURL}`, {
      method: "POST",
      headers,
      body: JSON.stringify(initData),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: transactionData = (await res.json()) as transactionData;
    return data;
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
    projectName: string | null;
    amountInCents: number | null;
    description: string | null;
    visible: boolean | null;
  },
): Promise<transactionData | null> {
  try {
    if (
      !(
        editData.projectName ||
        editData.amountInCents ||
        editData.description ||
        editData.visible
      )
    ) {
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

    const data: transactionData = (await res.json()) as transactionData;
    return data;
  } catch (error) {
    console.log(
      `Failed to edit transaction: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function setTransactionComplete(id: number) {
  try {
    const res = await fetch(`${baseURL}/${id}/complete`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
  } catch (error) {
    console.log(
      `Failed to set transaction status to complete: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function setTransactionCancelled(id: number) {
  try {
    const res = await fetch(`${baseURL}/${id}/cancel`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
  } catch (error) {
    console.log(
      `Failed to set transaction status to complete: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function setTransactionAccepted(id: number) {
  try {
    const res = await fetch(`${baseURL}/${id}/accept`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
  } catch (error) {
    console.log(
      `Failed to set transaction status to complete: ${(error as Error).message || error}`,
    );
    return null;
  }
}

export async function setTransactionReported(id: number) {
  try {
    const res = await fetch(`${baseURL}/${id}/report`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
  } catch (error) {
    console.log(
      `Failed to set transaction status to complete: ${(error as Error).message || error}`,
    );
    return null;
  }
}
