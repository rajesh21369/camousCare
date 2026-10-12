import React from 'react';
import StatusBadge from './StatusBadge';

export default function ProgressTimeline({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return <p className="text-muted fst-italic">No progress history recorded yet.</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_STUDENT': return 'Student';
      case 'ROLE_OFFICER': return 'Department Officer';
      case 'ROLE_ADMIN': return 'Administrator';
      case 'ROLE_MANAGEMENT': return 'Management';
      default: return role || 'System';
    }
  };

  return (
    <div className="timeline">
      {updates.map((item, index) => {
        const isResolved = item.newStatus === 'RESOLVED';
        const isEscalated = item.newStatus === 'ESCALATED';

        return (
          <div key={item.id || index} className="timeline-item">
            <div className={`timeline-dot ${isResolved ? 'resolved' : ''} ${isEscalated ? 'escalated' : ''}`}></div>
            <div className="card-custom p-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold text-dark">{item.actorName || 'System'}</span>
                  <span className="badge bg-light text-secondary border" style={{ fontSize: '0.72rem' }}>
                    {getRoleLabel(item.actorRole)}
                  </span>
                  {item.newStatus && (
                    <div className="ms-2 d-inline-flex align-items-center gap-1">
                      {item.oldStatus && item.oldStatus !== item.newStatus && (
                        <>
                          <span className="text-muted small">{item.oldStatus}</span>
                          <i className="bi bi-arrow-right text-muted small"></i>
                        </>
                      )}
                      <StatusBadge status={item.newStatus} />
                    </div>
                  )}
                </div>
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {formatDate(item.timestamp)}
                </small>
              </div>

              {item.publicComment && (
                <div className="mt-2 text-dark" style={{ fontSize: '0.925rem', whiteSpace: 'pre-wrap' }}>
                  {item.publicComment}
                </div>
              )}

              {item.internalNote && (
                <div className="mt-2 p-2 rounded bg-warning-subtle border border-warning text-dark small">
                  <div className="fw-bold text-warning-emphasis d-flex align-items-center gap-1 mb-1">
                    <i className="bi bi-lock-fill"></i> Private Internal Staff Note:
                  </div>
                  {item.internalNote}
                </div>
              )}

              {item.attachmentUri && (
                <div className="mt-2">
                  <a
                    href={item.attachmentUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary"
                  >
                    <i className="bi bi-paperclip me-1"></i> View Attachment
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
