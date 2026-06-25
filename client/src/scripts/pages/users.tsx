import { useParams } from "react-router-dom";
import type { userData } from "../../util/types";
import { apiKey, backendDomain } from "../../util/constants";
import { useState, useEffect } from "react";

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

async function fetchUserImage(id: number): Promise<unknown | null> {
  try {
    const headers = new Headers();
    headers.append("Access-Control-Allow-Origin", "*");

    const res = await fetch(
      `http://thumbnails.roproxy.com/v1/assets?assetId=${id}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`,
      {
        method: "GET",
        headers,
      },
    );

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data: unknown = await res.json();
    return data;
  } catch (error) {
    console.error(
      "Failed to fetch profile picture:",
      (error as Error).message || error,
    );
    return null;
  }
}

function UserProfilePage() {
  const { robloxUserId } = useParams<{ robloxUserId: string }>();
  const [data, setData] = useState<userData | null>(null);
  const [pfpData, setPfpData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (!robloxUserId) return;

      setIsLoading(true);
      const result = await fetchUserData(Number(robloxUserId));
      setData(result);

      const anotherResult = await fetchUserImage(Number(robloxUserId));
      setPfpData(anotherResult);

      setIsLoading(false);
    }

    loadData();
  }, [robloxUserId]);
  const pic = pfpData === null ? null : (pfpData!.thumbnailUrl as string);
  if (isLoading) {
    return <div>Loading user profile...</div>;
  }

  if (data === null) {
    return (
      <div>
        <h2>User Id is unregistered: {robloxUserId}</h2>
        <img src={pic ? pic : "a"}></img>
      </div>
    );
  }

  console.log(pic);
  return (
    <>
      <span>
        <img src={pic ? pic : "a"}></img>
        <h1>{data.robloxUsername}</h1>
      </span>
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
