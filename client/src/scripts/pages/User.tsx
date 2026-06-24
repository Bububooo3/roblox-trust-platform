import { useParams } from "react-router-dom";
import type { userData } from "../../util/types";
import { apiKey, backendDomain } from "../../util/constants";

async function fetchUserData(id: number): Promise<userData | null> {
  try {
    const header = new Headers();
    header.append("x-api-key", apiKey);

    const res = await fetch(`${backendDomain}/api/users/${id}`, {
      method: "GET",
      headers: header,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: userData = (await res.json()) as userData;
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
    <>
      <h1>{data.robloxUsername}</h1>
      <h3>
        <i>Last login: {new Date(data.lastLogin).toUTCString()}</i>
      </h3>
      <hr></hr>
      <div>
        <h4>
          Roblox Account Age:
          {(Math.round(data.robloxAccountAge / 365) > 0 ? " ~" : " ") +
            Math.round(data.robloxAccountAge / 365)}{" "}
          {Math.round(data.robloxAccountAge / 365) === 1 ? " year" : " years"}{" "}
          <i>({data.robloxAccountAge} days)</i>
        </h4>
        <h4>
          Platform Account Age:
          {(Math.round(data.productAccountAge / 365) > 0 ? " ~" : " ") +
            Math.round(data.productAccountAge / 365)}{" "}
          {Math.round(data.productAccountAge / 365) === 1 ? " year" : " years"}{" "}
          <i>({data.productAccountAge} days)</i>
        </h4>
      </div>
      <hr></hr>
    </>
  );
}

export default UserProfilePage;
