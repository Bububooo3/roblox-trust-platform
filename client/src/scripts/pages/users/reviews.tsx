import { useOutletContext } from "react-router-dom";
import type { reviewData, transactionData, userData } from "../../../util/types";
import ReviewCard from "../../components/ReviewCard";

type ProfileContext = {
  user: userData;
  transactions: transactionData[];
  reviews: reviewData[];
};

function UserReviewsPage() {
  const { reviews } = useOutletContext<ProfileContext>();

  return (
    <>
      <h2 className="h5 mb-3">Reviews received</h2>
      {reviews.length === 0 ? (
        <div className="rtp-card text-muted">No reviews yet.</div>
      ) : (
        reviews.map((review) => (
          <ReviewCard key={review.reviewID} review={review} />
        ))
      )}
    </>
  );
}

export default UserReviewsPage;
