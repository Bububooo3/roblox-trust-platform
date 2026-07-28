import { useOutletContext } from "react-router-dom";
import type { reviewData, transactionData, userData } from "../../../util/types";
import TransactionCard from "../../components/TransactionCard";
import ReviewCard from "../../components/ReviewCard";

type ProfileContext = {
  user: userData;
  transactions: transactionData[];
  reviews: reviewData[];
  averageRating: number | null;
};

function UserOverviewPage() {
  const { transactions, reviews } = useOutletContext<ProfileContext>();
  const recentTransactions = transactions.slice(0, 3);
  const recentReviews = reviews.slice(0, 3);

  return (
    <>
      <h2 className="h5 mb-3">Recent transactions</h2>
      {recentTransactions.length === 0 ? (
        <div className="rtp-card text-muted">No public transactions yet.</div>
      ) : (
        recentTransactions.map((transaction) => (
          <TransactionCard
            key={transaction.transactionID}
            transaction={transaction}
            compact
          />
        ))
      )}

      <h2 className="h5 mb-3 mt-4">Recent reviews</h2>
      {recentReviews.length === 0 ? (
        <div className="rtp-card text-muted">No reviews yet.</div>
      ) : (
        recentReviews.map((review) => (
          <ReviewCard key={review.reviewID} review={review} />
        ))
      )}
    </>
  );
}

export default UserOverviewPage;
