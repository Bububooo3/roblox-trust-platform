import { useOutletContext } from "react-router-dom";
import type { reviewData, transactionData, userData } from "../../../util/types";
import TransactionCard from "../../components/TransactionCard";

type ProfileContext = {
  user: userData;
  transactions: transactionData[];
  reviews: reviewData[];
};

function UserHistoryPage() {
  const { transactions } = useOutletContext<ProfileContext>();

  return (
    <>
      <h2 className="h5 mb-3">Transaction history</h2>
      {transactions.length === 0 ? (
        <div className="rtp-card text-muted">No transactions to show.</div>
      ) : (
        transactions.map((transaction) => (
          <TransactionCard
            key={transaction.transactionID}
            transaction={transaction}
          />
        ))
      )}
    </>
  );
}

export default UserHistoryPage;
