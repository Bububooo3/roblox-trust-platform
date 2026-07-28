import { Link } from "react-router-dom";
import type { reviewData } from "../../util/types";
import StarRating from "./StarRating";

export default function ReviewCard({ review }: { review: reviewData }) {
  return (
    <div className="rtp-card">
      <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
        <div>
          <StarRating rating={review.rating} />
          <div className="small text-muted mt-1">
            Reviewer{" "}
            <Link to={`/users/${review.reviewerId}`}>{review.reviewerId}</Link>
          </div>
        </div>
        <Link
          to={`/transactions/${review.linkedTransactionId}`}
          className="small"
        >
          Transaction #{review.linkedTransactionId}
        </Link>
      </div>
      <p className="mb-0 mt-2">{review.description}</p>
    </div>
  );
}
