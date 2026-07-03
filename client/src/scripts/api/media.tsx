import { apiKey, backendDomain } from "../../util/constants";
import type { mediaData, MediaTypeMirror } from "../../util/types";

// VARIABLES
const baseURL = `${backendDomain}/api/transactions`;
const headers = new Headers();
headers.append("x-api-key", apiKey);

// FUNCTIONS
export async function createMedia(
  transactionId: number,
  initData: { type: MediaTypeMirror; contentID: number; contentString: string },
): Promise<mediaData | null> {
  try {
    const res = await fetch(`${baseURL}/${transactionId}/media`, {
      method: "POST",
      headers,
      body: JSON.stringify(initData),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: mediaData = (await res.json()) as mediaData;
    return data;
  } catch (error) {
    console.log(`Failed to create media: ${(error as Error).message || error}`);
    return null;
  }
}

export async function getMediaFromTransaction(
  transactionId: number,
  mediaId: number,
): Promise<mediaData | null> {
  try {
    const res = await fetch(`${baseURL}/${transactionId}/media/${mediaId}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: mediaData = (await res.json()) as mediaData;
    return data;
  } catch (error) {
    console.log(`Failed to fetch media: ${(error as Error).message || error}`);
    return null;
  }
}

export async function deleteMediaFromTransaction(
  transactionId: number,
  mediaId: number,
) {
  try {
    const res = await fetch(`${baseURL}/${transactionId}/media/${mediaId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: mediaData = (await res.json()) as mediaData;
    return data;
  } catch (error) {
    console.log(`Failed to delete media: ${(error as Error).message || error}`);
    return null;
  }
}
