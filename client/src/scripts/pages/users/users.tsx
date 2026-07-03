import { useParams } from "react-router-dom";
import type { transactionDataCollection, userData } from "../../../util/types";
import { useState, useEffect } from "react";
import { NotFoundPage } from "../404";
import LoadingScreen from "../loading";
import TransactionInfoFrame from "../../components/transactionInfoFrame";
import { getUser, getUserTransactions } from "../../api/users";
import Notify from "../../functionality/notifications";
import { CToaster } from "@coreui/react";

const currentTime = Date.now();

export function UserProfilePage() {
  const { robloxUserId } = useParams<{ robloxUserId: string }>();
  const [myUserData, setMyUserData] = useState<userData | null>(null);
  const [myTransactionData, setMyTransactionData] =
    useState<transactionDataCollection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (!robloxUserId) return;

      setIsLoading(true);

      const userDataResult = await getUser(Number(robloxUserId));

      setMyUserData(userDataResult);

      const transactionDataResult = await getUserTransactions(
        Number(robloxUserId),
      );
      setMyTransactionData(transactionDataResult);

      setIsLoading(false);
    }

    loadData();
  }, [robloxUserId]);

  if (isLoading) {
    return <LoadingScreen details={<div>Loading user profile...</div>} />;
  }

  if (myUserData === null) {
    return (
      <>
        <NotFoundPage details={<>User Id is unregistered: {robloxUserId}</>} />
        {/* <div style={{margin: "2vw 10vh"}}> */}
          <CToaster placement="bottom-end">
            <Notify msg={`Failed to fetch user: ${robloxUserId}`} level={3} />
          </CToaster>
        {/* </div> */}
      </>
    );
  }

  const ageMS =
    currentTime - new Date(myUserData.productAccountCreationDate).getTime();

  /*
    ms | 1 s     | 1 m  | 1 hr | 1 d
      | 1000 ms | 60 s | 60 m | 24 hr
  */

  const ageDays = ageMS / (1000 * 60 * 60 * 24);
  const ageYearsApprox = ageDays / (7 * 52);

  return (
    <>
      <span>
        <h1>{myUserData.robloxUsername}</h1>
      </span>
      <h3>
        <i>Last login: {new Date(myUserData.lastLogin).toUTCString()}</i>
      </h3>
      <hr></hr>
      <div>
        <h4>
          Roblox Account Age:
          {(Math.round(myUserData.robloxAccountAge / 365) > 0 ? " ~" : " ") +
            Math.round(myUserData.robloxAccountAge / 365)}{" "}
          {Math.round(myUserData.robloxAccountAge / 365) === 1
            ? " year"
            : " years"}{" "}
          <i>({myUserData.robloxAccountAge} days)</i>
        </h4>
        <h4>
          Platform Account Age: {Math.round(ageYearsApprox)}{" "}
          {Math.round(ageYearsApprox) === 1 ? " year" : " years"}{" "}
          <i>({Math.floor(ageDays)} days)</i>
        </h4>
      </div>
      <hr></hr>
      <h2>Transaction History</h2>
      {myTransactionData && myTransactionData.data
        ? myTransactionData.data.map((transaction, index) => (
            <TransactionInfoFrame details={transaction} index={index} />
          ))
        : ""}
    </>
  );
}

export default UserProfilePage;
