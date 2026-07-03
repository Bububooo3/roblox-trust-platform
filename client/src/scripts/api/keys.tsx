import { apiKey, backendDomain } from "../../util/constants";

// VARIABLES
const baseURL = `${backendDomain}/api-keys`;
const headers = new Headers();
headers.append("x-api-key", apiKey);

// FUNCTIONS
export async function generateAPIKey(name: string): Promise<string | null> {
  if (name.length < 1) {
    throw new Error(`Invalid name!`);
  }

  try {
    const res = await fetch(`${baseURL}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: name }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: string = (await res.json()) as string;
    return data;
  } catch (error) {
    console.log(`Failed to generate API key: ${(error as Error).message || (error as string)}`)
    return null;
  }
}

export async function deleteAPIKey(key: string) {
  try {
    const res = await fetch(`${baseURL}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ apiKey: key }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: string = (await res.json()) as string;
    return data;
  } catch (error) {
    console.log(`Failed to delete API key: ${(error as Error).message || error}`);
    return null;
  }
}
