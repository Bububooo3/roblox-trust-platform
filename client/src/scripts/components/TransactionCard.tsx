import { Link } from "react-router-dom";
import { CButton } from "@coreui/react";
import type { transactionData } from "../../util/types";
import { formatCents, formatDate } from "../../util/format";
import StatusBadge from "./StatusBadge";

export default function TransactionCard({
  transaction,
  compact = false,
}: {
  transaction: transactionData;
  compact?: boolean;
}) {
  return (
    <div className="rtp-card">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <h3 className="h5 mb-1">{transaction.projectName}</h3>
          <p className="text-muted mb-2">{transaction.description}</p>
          {!compact && (
            <div className="small text-muted">
              Created {formatDate(transaction.createdAt)}
              {transaction.completedAt &&
                ` · Completed ${formatDate(transaction.completedAt)}`}
            </div>
          )}
        </div>
        <div className="text-end">
          <div className="fw-bold">{formatCents(transaction.amountInCents, transaction.currency)}</div>
          <StatusBadge status={transaction.status} />
        </div>
      </div>

      {!compact && (
        <div className="rtp-grid-2 mt-3">
          <div>
            <div className="small text-muted">Client</div>
            <Link to={`/users/${transaction.clientId}`}>{transaction.clientId}</Link>
          </div>
          <div>
            <div className="small text-muted">Developer</div>
            <Link to={`/users/${transaction.developerId}`}>{transaction.developerId}</Link>
          </div>
        </div>
      )}

      <div className="mt-3">
        <CButton
          as={Link}
          to={`/transactions/${transaction.transactionID}`}
          color="primary"
          variant="outline"
          size="sm"
        >
          View details
        </CButton>
      </div>
    </div>
  );
}
