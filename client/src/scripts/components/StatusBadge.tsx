import type { StatusMirror } from "../../util/types";

const statusClass: Record<StatusMirror, string> = {
  Success: "status-success",
  Ongoing: "status-ongoing",
  Pending: "status-pending",
  Cancelled: "status-cancelled",
  Reported: "status-reported",
};

export default function StatusBadge({ status }: { status: StatusMirror }) {
  return <span className={`status-badge ${statusClass[status]}`}>{status}</span>;
}
