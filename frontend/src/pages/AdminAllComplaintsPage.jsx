import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const STATUSES = ['ALL','SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS',
  'MORE_INFO_REQUIRED','RESOLVED','CLOSED','ESCALATED','REJECTED','REOPENED'];
const PRIORITIES = ['ALL','LOW','MEDIUM','HIGH','URGENT'];
const PAGE_SIZE = 15;

export default function AdminAllComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'ALL',
    priority: 'ALL',
    departmentId: '',
    search: '',
    overdue: searchParams.get('overdue') === 'true',
  });

  useEffect(() => { fetchDepartments(); }, []);

  useEffect(() => {
    setPage(0);
    fetchComplaints(0);
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.success) setDepartments(res.data || []);
    } catch {}
  };

  const fetchComplaints = useCallback(async (pageNum = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pageNum, size: PAGE_SIZE });
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.search) params.append('search', filters.search);
      if (filters.overdue) params.append('overdue', 'true');

      const res = await api.get(`/complaints/all?${params.toString()}`);
      if (res.success) {
        setComplaints(res.data?.content || res.data || []);
        setTotal(res.data?.totalElements || (Array.isArray(res.data) ? res.data.length : 0));
      }
    } catch {
      showToast('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchComplaints(newPage);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-1 fw-bold">All Complaints</h4>
          <p className="text-muted mb-0">
            College-wide complaint management
            {total > 0 && <span className="ms-2 badge bg-secondary">{total} total</span>}
          </p>
        </div>
        <Link to="/admin/assign" className="btn btn-primary btn-sm">
          <i className="bi bi-person-check me-1"></i>Assign Complaints
        </Link>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold mb-1">Search</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tracking # or title..."
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Status</label>
              <select className="form-select form-select-sm" value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g,' ')}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Priority</label>
              <select className="form-select form-select-sm" value={filters.priority}
                onChange={e => handleFilterChange('priority', e.target.value)}>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p === 'ALL' ? 'All Priorities' : p}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Department</label>
              <select className="form-select form-select-sm" value={filters.departmentId}
                onChange={e => handleFilterChange('departmentId', e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <div className="form-check mt-3">
                <input className="form-check-input" type="checkbox" id="overdueFilter"
                  checked={filters.overdue}
                  onChange={e => handleFilterChange('overdue', e.target.checked)} />
                <label className="form-check-label small fw-semibold" htmlFor="overdueFilter">
                  Overdue Only
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted mt-2">No complaints found</p>
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
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Submitted</th>
                    <th>Due Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => {
                    const isOverdue = c.dueDate && new Date(c.dueDate) < new Date() &&
                      !['RESOLVED','CLOSED','REJECTED'].includes(c.status);
                    return (
                      <tr key={c.id} className={isOverdue ? 'table-warning' : ''}>
                        <td className="ps-3">
                          <span className="badge bg-light text-dark border font-monospace">
                            {c.trackingNumber}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold">{c.title}</div>
                          <div className="text-muted small">{c.categoryName}</div>
                        </td>
                        <td>
                          <div className="small">{c.studentName}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{c.studentEmail}</div>
                        </td>
                        <td>
                          <div className="small">{c.departmentName || '—'}</div>
                          {c.assignedOfficerName && (
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              <i className="bi bi-person me-1"></i>{c.assignedOfficerName}
                            </div>
                          )}
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td><PriorityBadge priority={c.priority} /></td>
                        <td className="small text-muted">
                          {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="small">
                          {c.dueDate ? (
                            <span className={isOverdue ? 'text-danger fw-semibold' : 'text-muted'}>
                              {isOverdue && <i className="bi bi-exclamation-circle me-1"></i>}
                              {new Date(c.dueDate).toLocaleDateString()}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="text-center">
                          <Link to={`/complaints/${c.id}`} className="btn btn-sm btn-outline-primary me-1">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link to={`/admin/assign?complaintId=${c.id}`} className="btn btn-sm btn-outline-secondary">
                            <i className="bi bi-person-check"></i>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Page {page + 1} of {totalPages} ({total} results)
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(page - 1)}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pg = Math.max(0, Math.min(page - 2 + i, totalPages - 1));
                  return (
                    <li key={pg} className={`page-item ${pg === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(pg)}>{pg + 1}</button>
                    </li>
                  );
                })}
                <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
