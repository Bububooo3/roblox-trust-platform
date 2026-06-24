import { useParams } from "react-router-dom";
import type { userData } from "../../util/types";
import { apiKey, backendDomain } from "../../util/constants";

async function fetchUserData(id: number): Promise<userData | null> {
  try {
    const header = new Headers();
    header.append("x-api-key", apiKey);

    const response = await fetch(`${backendDomain}/api/users/${id}`, {
      method: "GET",
      headers: header,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: userData = (await response.json()) as userData;
    return data;
  } catch (error) {
    console.error("Failed to fetch user:", (error as Error).message || error);
    return null;
  }
}

import { useState, useEffect } from "react";

function UserProfilePage() {
  const { robloxUserId } = useParams<{ robloxUserId: string }>();
  const [data, setData] = useState<userData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (!robloxUserId) return;

      setIsLoading(true);
      const result = await fetchUserData(Number(robloxUserId));
      setData(result);
      setIsLoading(false);
    }

    loadData();
  }, [robloxUserId]);

  if (isLoading) {
    return <div>Loading user profile...</div>;
  }

  if (data === null) {
    return (
      <div>
        <h2>User Id is unregistered: {robloxUserId}</h2>
      </div>
    );
  }

  return (
    <div>
      <h2>Viewing User ID: {data.id}</h2>
      {/* Render other user data fields here */}
    </div>
  );
}

export default UserProfilePage;
