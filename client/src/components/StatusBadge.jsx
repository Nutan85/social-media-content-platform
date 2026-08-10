const STATUS_LABELS = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  scheduled: 'Scheduled',
  published: 'Published',
};

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  return <span className={`badge badge-${status}`}>{label}</span>;
}
