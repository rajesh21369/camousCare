import React from 'react';

const priorityConfig = {
  LOW: { label: 'Low', bg: '#f1f5f9', color: '#475569', icon: 'bi-arrow-down' },
  MEDIUM: { label: 'Medium', bg: '#e0f2fe', color: '#0369a1', icon: 'bi-dash' },
  HIGH: { label: 'High', bg: '#fef3c7', color: '#b45309', icon: 'bi-arrow-up' },
  CRITICAL: { label: 'Critical', bg: '#fee2e2', color: '#b91c1c', icon: 'bi-fire' },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <span
      className="badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: '600',
        padding: '0.35rem 0.65rem',
        borderRadius: '6px',
        fontSize: '0.785rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      <i className={`bi ${config.icon}`}></i>
      {config.label}
    </span>
  );
}
