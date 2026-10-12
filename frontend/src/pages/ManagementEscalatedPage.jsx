import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function ManagementEscalatedPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchEscalated();
  }, []);

  const fetchEscalated = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/escalated');
      if (res.success) setComplaints(res.data?.content || res.data || []);
    } catch {
      showToast('Failed to load escalated complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-1 fw-bold text-danger">
            <i className="bi bi-shield-exclamation me-2"></i>Escalated Complaints
          </h4>
          <p className="text-muted mb-0">High-priority institutional concerns requiring management oversight</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchEscalated}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-shield-check fs-1 text-success"></i>
              <p className="text-muted mt-2">Zero escalated complaints! Everything is on schedule.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Tracking #</th>
                    <th>Title</th>
                    <th>Student</th>
                    <th>Department</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td className="ps-3 font-monospace fw-bold text-danger">{c.trackingNumber}</td>
                      <td>
                        <div className="fw-semibold">{c.title}</div>
                        <div className="small text-muted">{c.categoryName}</div>
                      </td>
                      <td className="small">{c.studentName}</td>
                      <td className="small">{c.departmentName || '—'}</td>
                      <td className="small">{c.assignedOfficerName || 'Unassigned'}</td>
                      <td><PriorityBadge priority={c.priority} /></td>
                      <td><StatusBadge status={c.status} /></td>
                      <td className="text-center">
                        <Link to={`/complaints/${c.id}`} className="btn btn-sm btn-outline-danger">
                          <i className="bi bi-eye me-1"></i>Inspect
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
