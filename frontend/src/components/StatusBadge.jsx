import React from 'react';

const statusConfig = {
  SUBMITTED: { label: 'Submitted', bg: '#e0f2fe', color: '#0369a1', icon: 'bi-file-earmark-plus' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#fef3c7', color: '#b45309', icon: 'bi-search' },
  ASSIGNED: { label: 'Assigned', bg: '#ede9fe', color: '#6d28d9', icon: 'bi-person-check' },
  IN_PROGRESS: { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', icon: 'bi-gear-wide-connected' },
  MORE_INFO_REQUIRED: { label: 'Info Required', bg: '#ffedd5', color: '#c2410c', icon: 'bi-question-circle' },
  RESOLVED: { label: 'Resolved', bg: '#dcfce7', color: '#15803d', icon: 'bi-check2-circle' },
  CLOSED: { label: 'Closed', bg: '#f1f5f9', color: '#475569', icon: 'bi-archive' },
  REOPENED: { label: 'Reopened', bg: '#fee2e2', color: '#b91c1c', icon: 'bi-arrow-repeat' },
  ESCALATED: { label: 'Escalated', bg: '#ffe4e6', color: '#be123c', icon: 'bi-exclamation-triangle-fill' },
  REJECTED: { label: 'Rejected', bg: '#f3f4f6', color: '#6b7280', icon: 'bi-x-circle' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    bg: '#f3f4f6',
    color: '#6b7280',
    icon: 'bi-dot',
  };

  return (
    <span
      className="badge-status"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      <i className={`bi ${config.icon}`}></i>
      {config.label}
    </span>
  );
}
