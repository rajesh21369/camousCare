import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyComplaints();
  }, []);

  const loadMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED' || c.status === 'UNDER_REVIEW'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const actionRequiredCount = complaints.filter((c) => c.status === 'MORE_INFO_REQUIRED').length;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card-custom bg-navy text-white p-4 mb-4 shadow-sm border-0 position-relative overflow-hidden">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 position-relative" style={{ zIndex: 2 }}>
          <div>
            <span className="badge bg-primary px-3 py-1 rounded-pill mb-2">Student Dashboard</span>
            <h3 className="fw-bold mb-1">Welcome back, {user?.fullName || user?.username}!</h3>
            <p className="text-light opacity-75 mb-0 small">
              Student ID: <span className="fw-semibold text-white">{user?.studentOrStaffId || 'N/A'}</span> &bull; 
              Track your lodged complaints or submit new campus issues below.
            </p>
          </div>
          <Link to="/student/submit-complaint" className="btn btn-primary btn-lg shadow-sm px-4 d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle-fill"></i>
            <span>Submit New Complaint</span>
          </Link>
        </div>
      </div>

      {/* Action Required Alert if any complaint needs student response */}
      {actionRequiredCount > 0 && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 border-warning shadow-sm" role="alert">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill fs-4 text-warning-emphasis"></i>
            <div>
              <strong>Action Needed:</strong> A department officer has requested additional information on {actionRequiredCount} of your complaints.
            </div>
          </div>
          <Link to="/student/complaints?status=MORE_INFO_REQUIRED" className="btn btn-sm btn-warning text-dark fw-bold">
            Respond Now
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Total Lodged</div>
              <h2 className="fw-bold mb-0 text-navy">{totalCount}</h2>
            </div>
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-folder-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">In Progress / Active</div>
              <h2 className="fw-bold mb-0 text-primary">{inProgressCount}</h2>
            </div>
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <i className="bi bi-hourglass-split"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Resolved & Closed</div>
              <h2 className="fw-bold mb-0 text-success">{resolvedCount}</h2>
            </div>
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-check2-circle"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">More Info Required</div>
              <h2 className="fw-bold mb-0 text-warning">{actionRequiredCount}</h2>
            </div>
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-question-circle-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card-custom mb-4">
        <div className="card-header-clean d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark">Recent Complaints</h5>
          <Link to="/student/complaints" className="small text-primary text-decoration-none fw-semibold">
            View All ({totalCount}) <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="text-muted small mt-2">Loading complaints...</div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted display-4"></i>
              <p className="text-muted mt-2">You haven't lodged any complaints yet.</p>
              <Link to="/student/submit-complaint" className="btn btn-navy btn-sm">
                Register Your First Complaint
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-3 text-nowrap">Tracking ID</th>
                    <th>Complaint Title</th>
                    <th className="text-nowrap">Category</th>
                    <th className="text-nowrap">Priority</th>
                    <th className="text-nowrap">Status</th>
                    <th className="text-nowrap">Lodged Date</th>
                    <th className="pe-3 text-end text-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 5).map((c) => (
                    <tr key={c.id}>
                      <td className="ps-3 text-nowrap">
                        <span className="font-monospace fw-bold text-primary">{c.trackingNumber}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '300px' }}>
                          {c.title}
                        </div>
                        {c.campusLocation && (
                          <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                            <i className="bi bi-geo-alt me-1"></i>{c.campusLocation}
                          </div>
                        )}
                      </td>
                      <td className="text-nowrap">
                        <span className="badge bg-light text-dark border">{c.categoryName}</span>
                      </td>
                      <td className="text-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="text-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="small text-muted text-nowrap">
                        {new Date(c.submissionDate || c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="pe-3 text-end text-nowrap">
                        <Link to={`/complaints/${c.id}`} className="btn btn-sm btn-outline-primary px-3">
                          View Status
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
