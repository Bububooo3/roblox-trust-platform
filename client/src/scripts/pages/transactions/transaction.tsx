import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CAlert,
  CButton,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from "@coreui/react";
import { getTransaction } from "../../api/users";
import {
  setTransactionAccepted,
  setTransactionCancelled,
  setTransactionComplete,
  setTransactionReported,
} from "../../api/transactions";
import { submitReview } from "../../api/reviews";
import type { transactionData } from "../../../util/types";
import { formatCents, formatDateTime } from "../../../util/format";
import LoadingScreen from "../loading";
import { NotFoundPage } from "../404";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { newNotif } from "../../components/notifMaker";

function TransactionPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { user, refresh } = useAuth();
  const [transaction, setTransaction] = useState<transactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewDescription, setReviewDescription] = useState("");

  async function reload() {
    if (!transactionId) return;
    setLoading(true);
    const data = await getTransaction(Number(transactionId));
    setTransaction(data);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, [transactionId]);

  if (loading) {
    return <LoadingScreen details="Loading transaction..." />;
  }

  if (!transaction) {
    return (
      <NotFoundPage
        details={<>Transaction #{transactionId} was not found or is not accessible.</>}
      />
    );
  }

  const isParticipant =
    user &&
    (user.rblxUserID === transaction.clientId ||
      user.rblxUserID === transaction.developerId);

  const isClient = user?.rblxUserID === transaction.clientId;
  const isDeveloper = user?.rblxUserID === transaction.developerId;
  const alreadyReviewed = isClient
    ? Boolean(transaction.clientReviewId)
    : isDeveloper
      ? Boolean(transaction.developerReviewId)
      : false;

  async function runAction(
    action: () => Promise<transactionData | null>,
    successMessage: string,
  ) {
    setActionLoading(true);
    const result = await action();
    setActionLoading(false);

    if (result) {
      setTransaction(result);
      newNotif(successMessage, 1);
      if (result.status === "Success") {
        setShowReviewModal(true);
      }
    } else {
      newNotif("Action failed. You may need to be logged in.", 3);
    }
  }

  async function handleReviewSubmit() {
    if (!user || !transaction) return;

    setActionLoading(true);
    const result = await submitReview(transaction.transactionID, {
      rating: reviewRating,
      description: reviewDescription,
      reviewerId: user.rblxUserID,
    });
    setActionLoading(false);

    if (result) {
      setTransaction(result.transaction);
      setShowReviewModal(false);
      newNotif("Review submitted.", 1);
      void refresh();
    } else {
      newNotif("Could not submit review.", 3);
    }
  }

  return (
    <div className="rtp-page">
      <div className="rtp-card">
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
          <div>
            <h1 className="h3 mb-1">{transaction.projectName}</h1>
            <div className="text-muted">Transaction #{transaction.transactionID}</div>
          </div>
          <div className="text-end">
            <div className="h4 mb-1">
              {formatCents(transaction.amountInCents, transaction.currency)}
            </div>
            <StatusBadge status={transaction.status} />
          </div>
        </div>

        <p>{transaction.description}</p>

        <div className="rtp-grid-2">
          <div>
            <div className="small text-muted">Client</div>
            <Link to={`/users/${transaction.clientId}`}>
              User {transaction.clientId}
            </Link>
          </div>
          <div>
            <div className="small text-muted">Developer</div>
            <Link to={`/users/${transaction.developerId}`}>
              User {transaction.developerId}
            </Link>
          </div>
          <div>
            <div className="small text-muted">Created</div>
            {formatDateTime(transaction.createdAt)}
          </div>
          <div>
            <div className="small text-muted">Last updated</div>
            {formatDateTime(transaction.updatedAt)}
          </div>
          {transaction.completedAt && (
            <div>
              <div className="small text-muted">Completed</div>
              {formatDateTime(transaction.completedAt)}
            </div>
          )}
          <div>
            <div className="small text-muted">Visibility</div>
            {transaction.visible ? "Public" : "Participants only"}
          </div>
        </div>

        {!user && (
          <CAlert color="info" className="mt-3 mb-0">
            Log in with Roblox to accept, complete, cancel, or report this
            transaction.
          </CAlert>
        )}

        {isParticipant && (
          <div className="action-bar">
            {transaction.status === "Pending" && (
              <CButton
                color="primary"
                disabled={actionLoading}
                onClick={() =>
                  void runAction(
                    () => setTransactionAccepted(transaction.transactionID),
                    "Transaction accepted.",
                  )
                }
              >
                Accept
              </CButton>
            )}
            {(transaction.status === "Pending" ||
              transaction.status === "Ongoing") && (
              <CButton
                color="secondary"
                disabled={actionLoading}
                onClick={() =>
                  void runAction(
                    () => setTransactionCancelled(transaction.transactionID),
                    "Transaction cancelled.",
                  )
                }
              >
                Cancel
              </CButton>
            )}
            {transaction.status === "Ongoing" && (
              <CButton
                color="success"
                disabled={actionLoading}
                onClick={() =>
                  void runAction(
                    () => setTransactionComplete(transaction.transactionID),
                    "Transaction marked complete.",
                  )
                }
              >
                Mark complete
              </CButton>
            )}
            {["Pending", "Ongoing", "Success"].includes(transaction.status) && (
              <CButton
                color="danger"
                variant="outline"
                disabled={actionLoading}
                onClick={() =>
                  void runAction(
                    () => setTransactionReported(transaction.transactionID),
                    "Transaction reported.",
                  )
                }
              >
                Report dispute
              </CButton>
            )}
            {transaction.status === "Success" && !alreadyReviewed && (
              <CButton
                color="warning"
                disabled={actionLoading}
                onClick={() => setShowReviewModal(true)}
              >
                Leave review
              </CButton>
            )}
          </div>
        )}
      </div>

      <CModal visible={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <CModalHeader>
          <CModalTitle>Rate your experience</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel htmlFor="rating">Rating (1–5)</CFormLabel>
          <CFormInput
            id="rating"
            type="number"
            min={1}
            max={5}
            value={reviewRating}
            onChange={(event) => setReviewRating(Number(event.target.value))}
            className="mb-3"
          />
          <CFormLabel htmlFor="review-description">Feedback</CFormLabel>
          <CFormTextarea
            id="review-description"
            rows={4}
            value={reviewDescription}
            onChange={(event) => setReviewDescription(event.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            disabled={actionLoading || reviewDescription.trim().length === 0}
            onClick={() => void handleReviewSubmit()}
          >
            Submit review
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}

export default TransactionPage;
