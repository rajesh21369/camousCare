import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ProgressTimeline from '../components/ProgressTimeline';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student respond state (for MORE_INFO_REQUIRED)
  const [studentReply, setStudentReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Student reopen modal state
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);

  // Feedback state (for RESOLVED/CLOSED)
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [satisfactionCategory, setSatisfactionCategory] = useState('Overall');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadComplaintDetails();
  }, [id]);

  const loadComplaintDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.success && res.data) {
        setComplaint(res.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  // Student responds to MORE_INFO_REQUIRED
  const handleStudentReplySubmit = async (e) => {
    e.preventDefault();
    if (!studentReply.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await api.put(`/complaints/${id}/status`, {
        publicComment: studentReply.trim(),
        status: 'IN_PROGRESS', // Switches status back to In Progress once student responds
      });
      if (res.success) {
        showSuccess('Information provided! The officer has been notified.');
        setStudentReply('');
        loadComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to submit response');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Student reopens complaint
  const handleReopenSubmit = async () => {
    if (!reopenReason.trim()) {
      showError('Please provide a reason for reopening');
      return;
    }

    setSubmittingReopen(true);
    try {
      const res = await api.put(`/complaints/${id}/reopen`, {
        reason: reopenReason.trim(),
      });
      if (res.success) {
        showSuccess('Complaint reopened. The team will re-investigate.');
        setShowReopenModal(false);
        setReopenReason('');
        loadComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to reopen complaint');
    } finally {
      setSubmittingReopen(false);
    }
  };

  // Student submits feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const payload = {
        rating: Number(rating),
        comment: feedbackComment.trim(),
        satisfactionCategory,
      };
      const res = await api.post(`/feedback/${id}`, payload);
      if (res.success) {
        showSuccess('Thank you for rating our resolution!');
        loadComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted small mt-2">Loading complaint details...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="card-custom p-5 text-center bg-white">
        <i className="bi bi-exclamation-circle display-4 text-warning"></i>
        <h4 className="fw-bold mt-3">Complaint Not Found</h4>
        <p className="text-muted">The requested complaint could not be found or you do not have permission to access it.</p>
        <Link to="/student/complaints" className="btn btn-navy btn-sm">
          Return to Complaints
        </Link>
      </div>
    );
  }

  const isStudent = user?.role === 'ROLE_STUDENT';
  const isOfficerOrAdmin = user?.role === 'ROLE_OFFICER' || user?.role === 'ROLE_ADMIN';
  const canReopen = (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED' || complaint.status === 'REJECTED') && (isStudent || user?.role === 'ROLE_ADMIN');
  const canProvideFeedback = (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && isStudent && !complaint.feedbackSubmitted;

  return (
    <div>
      {/* Top Breadcrumb & Status Header */}
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
          {/* Quick link for staff to update */}
          {isOfficerOrAdmin && (
            <Link to={`/staff/complaint/${complaint.id}`} className="btn btn-navy d-flex align-items-center gap-1">
              <i className="bi bi-pencil-square"></i>
              <span>Update / Resolve</span>
            </Link>
          )}

          {canReopen && (
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-1"
              onClick={() => setShowReopenModal(true)}
            >
              <i className="bi bi-arrow-repeat"></i>
              <span>Request Reopening</span>
            </button>
          )}

          <button className="btn btn-light border" onClick={() => window.print()} title="Print Complaint Report">
            <i className="bi bi-printer"></i>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Details & Updates Column */}
        <div className="col-lg-8">
          {/* Rejection Alert Banner if rejected */}
          {complaint.status === 'REJECTED' && (
            <div className="alert alert-danger p-3 mb-4 rounded-3 border-danger shadow-sm">
              <h6 className="fw-bold text-danger mb-1">
                <i className="bi bi-x-octagon-fill me-1"></i> Complaint Rejected
              </h6>
              <p className="mb-0 small">
                <strong>Reason:</strong> {complaint.rejectionReason || 'Not specified'}
              </p>
            </div>
          )}

          {/* Description Card */}
          <div className="card-custom p-4 bg-white mb-4">
            <h6 className="fw-bold text-navy mb-3 text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Complaint Overview
            </h6>
            <p className="text-dark mb-4" style={{ fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {complaint.description}
            </p>

            {/* Attachments Section */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="border-top pt-3">
                <h6 className="fw-bold text-dark small mb-2">Attached Documents / Evidence:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {complaint.attachments.map((att, idx) => (
                    <a
                      key={att.fileId || idx}
                      href={att.fileDownloadUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-light border d-inline-flex align-items-center gap-2 text-decoration-none"
                    >
                      <i className="bi bi-paperclip text-primary"></i>
                      <span className="text-truncate" style={{ maxWidth: '240px' }}>{att.fileName}</span>
                      <i className="bi bi-box-arrow-up-right small text-muted"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student Response Box (when More Info is requested) */}
          {isStudent && complaint.status === 'MORE_INFO_REQUIRED' && (
            <div className="card-custom p-4 bg-warning bg-opacity-10 border-warning mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-exclamation-circle-fill text-warning fs-4"></i>
                <h5 className="fw-bold text-dark mb-0">More Information Requested by Officer</h5>
              </div>
              <p className="text-secondary small mb-3">
                Please respond below with the requested details to allow the investigating team to proceed with your complaint.
              </p>
              <form onSubmit={handleStudentReplySubmit}>
                <textarea
                  className="form-control mb-3"
                  rows={3}
                  placeholder="Type your response here..."
                  value={studentReply}
                  onChange={(e) => setStudentReply(e.target.value)}
                  required
                ></textarea>
                <button
                  type="submit"
                  className="btn btn-warning fw-semibold px-4"
                  disabled={submittingReply}
                >
                  {submittingReply ? 'Submitting Response...' : 'Send Information'}
                </button>
              </form>
            </div>
          )}

          {/* Feedback Section if Resolved */}
          {canProvideFeedback && (
            <div className="card-custom p-4 bg-white border-success mb-4 shadow-sm">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-star-fill text-warning fs-4"></i>
                <h5 className="fw-bold text-dark mb-0">Rate Resolution Quality</h5>
              </div>
              <p className="text-muted small mb-3">
                This complaint was marked as resolved. Please share your rating and feedback to help us maintain college service quality.
              </p>

              <form onSubmit={handleFeedbackSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Star Rating *</label>
                  <div className="d-flex align-items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} fs-3 text-warning`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setRating(star)}
                      ></i>
                    ))}
                    <span className="ms-2 fw-bold text-dark">{rating} / 5 Stars</span>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Satisfaction Category</label>
                    <select
                      className="form-select form-select-sm"
                      value={satisfactionCategory}
                      onChange={(e) => setSatisfactionCategory(e.target.value)}
                    >
                      <option value="Timeliness">Timeliness & Speed</option>
                      <option value="Quality of Work">Quality of Repair / Service</option>
                      <option value="Staff Communication">Staff Courtesy & Communication</option>
                      <option value="Overall">Overall Experience</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Feedback Comment *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe your satisfaction with the resolution..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-success fw-semibold px-4"
                  disabled={submittingFeedback}
                >
                  {submittingFeedback ? 'Submitting Feedback...' : 'Submit Rating'}
                </button>
              </form>
            </div>
          )}

          {/* Feedback Display if already submitted */}
          {complaint.feedback && (
            <div className="card-custom p-4 bg-success bg-opacity-10 border-success mb-4">
              <h6 className="fw-bold text-success mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill"></i> Student Resolution Rating
              </h6>
              <div className="d-flex align-items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`bi ${star <= complaint.feedback.rating ? 'bi-star-fill' : 'bi-star'} text-warning fs-5`}
                  ></i>
                ))}
                <span className="ms-2 fw-bold text-dark">{complaint.feedback.rating} / 5</span>
                <span className="badge bg-light text-secondary border ms-2">
                  {complaint.feedback.satisfactionCategory}
                </span>
              </div>
              <p className="text-dark small mb-0 fst-italic">"{complaint.feedback.comment}"</p>
            </div>
          )}

          {/* Progress Timeline Card */}
          <div className="card-custom p-4 bg-white">
            <h5 className="fw-bold text-navy mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary"></i>
              <span>Resolution Progress History</span>
            </h5>
            <ProgressTimeline updates={complaint.updates} />
          </div>
        </div>

        {/* Sidebar Metadata Column */}
        <div className="col-lg-4">
          <div className="card-custom p-4 bg-white mb-4">
            <h6 className="fw-bold text-navy text-uppercase small mb-3" style={{ letterSpacing: '0.05em' }}>
              Tracking Metadata
            </h6>

            <ul className="list-unstyled mb-0" style={{ lineHeight: '2' }}>
              <li className="d-flex justify-content-between border-bottom py-2">
                <span className="text-muted small">Tracking ID</span>
                <span className="font-monospace fw-bold text-primary">{complaint.trackingNumber}</span>
              </li>

              <li className="d-flex justify-content-between border-bottom py-2">
                <span className="text-muted small">Category</span>
                <span className="fw-semibold text-dark small">{complaint.categoryName}</span>
              </li>

              <li className="d-flex justify-content-between border-bottom py-2">
                <span className="text-muted small">Department</span>
                <span className="fw-semibold text-dark small">{complaint.departmentName || 'Unassigned'}</span>
              </li>

              <li className="d-flex justify-content-between border-bottom py-2">
                <span className="text-muted small">Assigned Officer</span>
                <span className="fw-semibold text-dark small">{complaint.assignedOfficerName || 'Awaiting assignment'}</span>
              </li>

              <li className="d-flex justify-content-between border-bottom py-2">
                <span className="text-muted small">Campus Location</span>
                <span className="fw-semibold text-dark small text-end text-truncate" style={{ maxWidth: '170px' }}>
                  {complaint.campusLocation}
                </span>
              </li>

              <li className="d-flex justify-content-between border-bottom py-2">
                <span className="text-muted small">Lodged Date</span>
                <span className="text-dark small">
                  {new Date(complaint.submissionDate || complaint.createdAt).toLocaleDateString()}
                </span>
              </li>

              <li className="d-flex justify-content-between border-bottom py-2">
                <span className="text-muted small">Target SLA Due</span>
                <span className={`small ${complaint.overdue ? 'text-danger fw-bold' : 'text-dark'}`}>
                  {complaint.dueDate ? new Date(complaint.dueDate).toLocaleDateString() : 'N/A'}
                </span>
              </li>

              {complaint.resolutionDate && (
                <li className="d-flex justify-content-between py-2">
                  <span className="text-muted small">Resolved On</span>
                  <span className="text-success fw-bold small">
                    {new Date(complaint.resolutionDate).toLocaleDateString()}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="card-custom p-4 bg-white">
            <h6 className="fw-bold text-navy text-uppercase small mb-3" style={{ letterSpacing: '0.05em' }}>
              Student Information
            </h6>
            <div className="d-flex align-items-center gap-3">
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

      {/* Reopen Modal */}
      <ConfirmationModal
        show={showReopenModal}
        title="Request Complaint Reopening"
        confirmText={submittingReopen ? 'Submitting...' : 'Reopen Complaint'}
        confirmVariant="danger"
        onConfirm={handleReopenSubmit}
        onCancel={() => setShowReopenModal(false)}
      >
        <p className="text-muted small">
          Please explain why this issue is not fully resolved or has re-occurred:
        </p>
        <textarea
          className="form-control"
          rows={4}
          placeholder="State exact reasons for reopening..."
          value={reopenReason}
          onChange={(e) => setReopenReason(e.target.value)}
          required
        ></textarea>
      </ConfirmationModal>
    </div>
  );
}
