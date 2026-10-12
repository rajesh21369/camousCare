import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ProgressTimeline from '../components/ProgressTimeline';
import ConfirmationModal from '../components/ConfirmationModal';

export default function StaffComplaintUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [status, setStatus] = useState('');
  const [publicComment, setPublicComment] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [attachmentUri, setAttachmentUri] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reject modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectInternalNote, setRejectInternalNote] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.success && res.data) {
        setComplaint(res.data);
        setStatus(res.data.status);
      }
    } catch (err) {
      showError(err.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const handleEvidenceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.success && res.data) {
        setAttachmentUri(res.data.fileDownloadUri);
        showSuccess(`Uploaded resolution evidence '${file.name}'`);
      }
    } catch (err) {
      showError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!publicComment.trim() && !internalNote.trim() && status === complaint.status) {
      showError('Please select a new status or provide comments');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        status,
        publicComment: publicComment.trim(),
        internalNote: internalNote.trim(),
        attachmentUri,
      };

      const res = await api.put(`/complaints/${id}/status`, payload);
      if (res.success) {
        showSuccess('Complaint updated successfully!');
        setPublicComment('');
        setInternalNote('');
        setAttachmentUri('');
        loadComplaint();
      }
    } catch (err) {
      showError(err.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      showError('Rejection reason is mandatory');
      return;
    }

    setSubmittingReject(true);
    try {
      const res = await api.put(`/complaints/${id}/reject`, {
        reason: rejectReason.trim(),
        internalNote: rejectInternalNote.trim(),
      });
      if (res.success) {
        showSuccess('Complaint marked as rejected');
        setShowRejectModal(false);
        loadComplaint();
      }
    } catch (err) {
      showError(err.message || 'Failed to reject complaint');
    } finally {
      setSubmittingReject(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted small mt-2">Loading complaint...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="card-custom p-5 text-center bg-white">
        <h4 className="fw-bold">Complaint Not Found</h4>
        <Link to="/staff/assigned" className="btn btn-navy btn-sm mt-3">
          Back to Queue
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-light text-navy border font-monospace fs-6 px-2 py-1">
              {complaint.trackingNumber}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            {complaint.overdue && (
              <span className="badge bg-danger text-white">
                <i className="bi bi-clock-fill me-1"></i> SLA OVERDUE
              </span>
            )}
          </div>
          <h3 className="fw-bold text-dark mb-0">{complaint.title}</h3>
        </div>

        <div className="d-flex gap-2">
          {complaint.status !== 'REJECTED' && complaint.status !== 'CLOSED' && (
            <button
              className="btn btn-outline-danger btn-sm px-3"
              onClick={() => setShowRejectModal(true)}
            >
              <i className="bi bi-x-circle me-1"></i> Reject Complaint
            </button>
          )}
          <Link to={`/complaints/${complaint.id}`} className="btn btn-outline-secondary btn-sm px-3">
            <i className="bi bi-eye me-1"></i> Public View
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Update Action Form */}
        <div className="col-lg-7">
          <div className="card-custom p-4 bg-white mb-4">
            <h5 className="fw-bold text-navy mb-3">Record Investigation / Status Update</h5>
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold text-dark small">New Complaint Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ASSIGNED">ASSIGNED (In Queue)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Actively Investigating / Repairing)</option>
                  <option value="MORE_INFO_REQUIRED">MORE INFO REQUIRED (Requesting Student Clarification)</option>
                  <option value="RESOLVED">RESOLVED (Resolution Completed)</option>
                  <option value="CLOSED">CLOSED (Formally Closed)</option>
                  <option value="ESCALATED">ESCALATED (Elevated to Management / Principal)</option>
                </select>
                <div className="form-text small">
                  Allowed transitions: Under Review &rarr; Assigned &rarr; In Progress &rarr; Resolved &rarr; Closed.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-dark small">
                  Public Comment <span className="text-muted fw-normal">(Visible to Student & Staff)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="e.g. Technician dispatched to site; parts replaced; resolution verified..."
                  value={publicComment}
                  onChange={(e) => setPublicComment(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-3 p-3 bg-warning-subtle rounded-3 border border-warning">
                <label className="form-label fw-bold text-warning-emphasis small d-flex align-items-center gap-1">
                  <i className="bi bi-lock-fill"></i> Private Internal Staff Note <span className="text-muted fw-normal">(Hidden from Student)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Internal notes, technician vendor remarks, repair cost, or department audit references..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                ></textarea>
                <div className="form-text text-warning-emphasis small">
                  Internal notes are strictly restricted to staff and administrators.
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-dark small">Upload Resolution Evidence (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleEvidenceUpload}
                  disabled={uploading}
                />
                {attachmentUri && (
                  <div className="mt-2 text-success small">
                    <i className="bi bi-check-circle-fill me-1"></i> Evidence attached successfully.
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light px-3"
                  onClick={() => navigate('/staff/assigned')}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-navy px-4 fw-semibold d-flex align-items-center gap-2"
                  disabled={submitting || uploading}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      <span>Save & Post Update</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Timeline of Previous Updates */}
          <div className="card-custom p-4 bg-white">
            <h5 className="fw-bold text-navy mb-4">Complete Audit & Resolution History</h5>
            <ProgressTimeline updates={complaint.updates} />
          </div>
        </div>

        {/* Right Column: Complaint Context & Student Details */}
        <div className="col-lg-5">
          <div className="card-custom p-4 bg-white mb-4">
            <h6 className="fw-bold text-navy text-uppercase small mb-3" style={{ letterSpacing: '0.05em' }}>
              Complaint Information
            </h6>
            <h6 className="fw-bold text-dark">{complaint.title}</h6>
            <p className="small text-muted mb-3" style={{ whiteSpace: 'pre-wrap' }}>
              {complaint.description}
            </p>

            <ul className="list-unstyled mb-0 small" style={{ lineHeight: '2' }}>
              <li className="d-flex justify-content-between border-top pt-2">
                <span className="text-muted">Category:</span>
                <span className="fw-semibold text-dark">{complaint.categoryName}</span>
              </li>
              <li className="d-flex justify-content-between border-top pt-2">
                <span className="text-muted">Department:</span>
                <span className="fw-semibold text-dark">{complaint.departmentName || 'General'}</span>
              </li>
              <li className="d-flex justify-content-between border-top pt-2">
                <span className="text-muted">Campus Location:</span>
                <span className="fw-semibold text-dark text-end">{complaint.campusLocation}</span>
              </li>
              <li className="d-flex justify-content-between border-top pt-2">
                <span className="text-muted">Lodged On:</span>
                <span className="text-dark">{new Date(complaint.submissionDate || complaint.createdAt).toLocaleDateString()}</span>
              </li>
              <li className="d-flex justify-content-between border-top pt-2">
                <span className="text-muted">Target SLA Due:</span>
                <span className={`fw-bold ${complaint.overdue ? 'text-danger' : 'text-dark'}`}>
                  {complaint.dueDate ? new Date(complaint.dueDate).toLocaleDateString() : 'N/A'}
                </span>
              </li>
            </ul>

            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mt-3 border-top pt-3">
                <h6 className="small fw-bold text-dark mb-2">Attached Student Files:</h6>
                <div className="d-flex flex-column gap-1">
                  {complaint.attachments.map((a, i) => (
                    <a
                      key={i}
                      href={a.fileDownloadUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="small text-decoration-none text-primary d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-paperclip"></i>
                      <span className="text-truncate">{a.fileName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card-custom p-4 bg-white">
            <h6 className="fw-bold text-navy text-uppercase small mb-3" style={{ letterSpacing: '0.05em' }}>
              Student Contact
            </h6>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle bg-navy text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '42px', height: '42px' }}>
                {complaint.studentName ? complaint.studentName.charAt(0) : 'S'}
              </div>
              <div>
                <div className="fw-bold text-dark small">{complaint.studentName}</div>
                <div className="text-muted small">{complaint.studentEmail}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <ConfirmationModal
        show={showRejectModal}
        title="Reject Complaint"
        confirmText={submittingReject ? 'Rejecting...' : 'Reject Complaint'}
        confirmVariant="danger"
        onConfirm={handleRejectSubmit}
        onCancel={() => setShowRejectModal(false)}
      >
        <p className="text-muted small">
          A mandatory explanation is required. The student will be notified of this reason.
        </p>
        <div className="mb-3">
          <label className="form-label small fw-bold text-dark">Mandatory Reason *</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="e.g. Duplicate complaint, out of scope, not a valid college facility..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-2">
          <label className="form-label small fw-bold text-dark">Internal Staff Note (Optional)</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Internal justification..."
            value={rejectInternalNote}
            onChange={(e) => setRejectInternalNote(e.target.value)}
          ></textarea>
        </div>
      </ConfirmationModal>
    </div>
  );
}
