import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function StaffDepartmentOverviewPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDepartmentComplaints();
  }, [user]);

  const fetchDepartmentComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/department');
      if (res.success) setComplaints(res.data?.content || res.data || []);
    } catch {
      showToast('Failed to load department overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-1 fw-bold">Department Complaint Queue</h4>
          <p className="text-muted mb-0">
            All complaints filed under {user?.departmentName || 'your department'}
          </p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchDepartmentComplaints}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-folder-check fs-1 text-muted"></i>
              <p className="text-muted mt-2">No complaints lodged for this department.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Tracking #</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Assigned Officer</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td className="ps-3 font-monospace">{c.trackingNumber}</td>
                      <td>
                        <div className="fw-semibold">{c.title}</div>
                        <div className="small text-muted">{c.studentName}</div>
                      </td>
                      <td className="small">{c.categoryName}</td>
                      <td className="small">{c.assignedOfficerName || <span className="text-muted">Unassigned</span>}</td>
                      <td><PriorityBadge priority={c.priority} /></td>
                      <td><StatusBadge status={c.status} /></td>
                      <td className="small text-muted">{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}</td>
                      <td className="text-center">
                        <Link to={`/staff/complaint/${c.id}`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-pencil-square me-1"></i>Investigate
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
