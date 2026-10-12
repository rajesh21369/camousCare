import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewScope, setViewScope] = useState('assigned'); // 'assigned' or 'all'

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error('Failed to load officer complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const assignedToMe = complaints.filter((c) => c.assignedOfficerId === user?.id);
  const displayedComplaints = viewScope === 'assigned' ? assignedToMe : complaints;

  const totalAssigned = assignedToMe.length;
  const inProgressCount = assignedToMe.filter((c) => c.status === 'IN_PROGRESS').length;
  const overdueComplaints = complaints.filter((c) => c.overdue);
  const resolvedCount = assignedToMe.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div>
      {/* Header Banner */}
      <div className="card-custom bg-navy text-white p-4 mb-4 shadow-sm border-0">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <span className="badge bg-info text-dark px-3 py-1 rounded-pill mb-2">Officer Workspace</span>
            <h3 className="fw-bold mb-1">Welcome, {user?.fullName || user?.username}</h3>
            <p className="text-light opacity-75 mb-0 small">
              Manage department tickets, record investigation logs, request information, and resolve issues.
            </p>
          </div>
          <Link to="/staff/assigned" className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-inbox-fill"></i>
            <span>View All Assigned Queue</span>
          </Link>
        </div>
      </div>

      {/* Overdue Warning Alert */}
      {overdueComplaints.length > 0 && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 border-danger shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-clock-history fs-4 text-danger"></i>
            <div>
              <strong>SLA Overdue Warning:</strong> You have {overdueComplaints.length} complaints past their SLA target resolution date.
            </div>
          </div>
          <Link to="/staff/assigned?overdue=true" className="btn btn-sm btn-danger">
            View Overdue
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Assigned to Me</div>
              <h2 className="fw-bold mb-0 text-navy">{totalAssigned}</h2>
            </div>
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-person-check-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Actively Investigating</div>
              <h2 className="fw-bold mb-0 text-info">{inProgressCount}</h2>
            </div>
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <i className="bi bi-gear-wide-connected"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">SLA Overdue</div>
              <h2 className="fw-bold mb-0 text-danger">{overdueComplaints.length}</h2>
            </div>
            <div className="stat-icon bg-danger bg-opacity-10 text-danger">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Resolved Successfully</div>
              <h2 className="fw-bold mb-0 text-success">{resolvedCount}</h2>
            </div>
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-check2-circle"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Selector and Complaints Table */}
      <div className="card-custom mb-4">
        <div className="card-header-clean d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0 fw-bold text-dark">Complaint Action Queue</h5>
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${viewScope === 'assigned' ? 'btn-navy' : 'btn-outline-secondary'}`}
              onClick={() => setViewScope('assigned')}
            >
              Assigned to Me ({assignedToMe.length})
            </button>
            <button
              className={`btn ${viewScope === 'all' ? 'btn-navy' : 'btn-outline-secondary'}`}
              onClick={() => setViewScope('all')}
            >
              Department Wide ({complaints.length})
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="text-muted small mt-2">Loading assigned complaints...</div>
            </div>
          ) : displayedComplaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted display-4"></i>
              <p className="text-muted mt-2">No complaints in this queue.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-3 text-nowrap">Tracking ID</th>
                    <th>Complaint Title</th>
                    <th className="text-nowrap">Student</th>
                    <th className="text-nowrap">Priority</th>
                    <th className="text-nowrap">Status</th>
                    <th className="text-nowrap">Target Due Date</th>
                    <th className="pe-3 text-end text-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedComplaints.slice(0, 10).map((c) => (
                    <tr key={c.id}>
                      <td className="ps-3 text-nowrap">
                        <span className="font-monospace fw-bold text-primary">{c.trackingNumber}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '320px' }}>
                          {c.title}
                        </div>
                        {c.campusLocation && (
                          <div className="small text-muted text-truncate" style={{ maxWidth: '320px' }}>
                            <i className="bi bi-geo-alt me-1"></i>{c.campusLocation}
                          </div>
                        )}
                      </td>
                      <td className="text-nowrap">
                        <div className="small fw-semibold text-dark">{c.studentName}</div>
                        <div className="small text-muted">{c.studentEmail}</div>
                      </td>
                      <td className="text-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="text-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="small text-nowrap">
                        {c.dueDate ? (
                          <span className={c.overdue ? 'text-danger fw-bold' : 'text-muted'}>
                            {new Date(c.dueDate).toLocaleDateString()}
                            {c.overdue && <i className="bi bi-clock-fill text-danger ms-1"></i>}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="pe-3 text-end text-nowrap">
                        <Link to={`/staff/complaint/${c.id}`} className="btn btn-sm btn-navy px-3">
                          Investigate
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
