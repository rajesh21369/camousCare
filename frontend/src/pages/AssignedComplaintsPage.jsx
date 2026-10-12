import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function AssignedComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(searchParams.get('overdue') === 'true');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadComplaints();
  }, [filterStatus, filterPriority, overdueOnly]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (overdueOnly) params.overdueOnly = true;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/complaints', { params });
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComplaints();
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setOverdueOnly(false);
    setSearchTerm('');
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-navy mb-1">Assigned Department Complaints</h3>
          <p className="text-muted small mb-0">
            Review grievances, monitor turnaround targets, and process investigations.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-custom p-3 mb-4 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search ID, title, student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="MORE_INFO_REQUIRED">More Info Required</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REOPENED">Reopened</option>
              <option value="ESCALATED">Escalated</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="col-md-2 col-sm-6">
            <select
              className="form-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="col-md-3 d-flex align-items-center gap-2">
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="overdueSwitch"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
              />
              <label className="form-check-label small fw-semibold text-danger" htmlFor="overdueSwitch">
                Overdue Only
              </label>
            </div>

            <button type="submit" className="btn btn-navy btn-sm px-3 ms-auto">
              Apply
            </button>
            {(filterStatus || filterPriority || overdueOnly || searchTerm) && (
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card-custom">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="text-muted small mt-2">Loading complaints...</div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-folder-check display-4 text-muted"></i>
              <p className="text-muted mt-2">No complaints matched your filter criteria.</p>
              <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th>Tracking ID</th>
                    <th>Complaint Title</th>
                    <th>Student Name</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>SLA Deadline</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className="font-monospace fw-bold text-primary">{c.trackingNumber}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '280px' }}>
                          {c.title}
                        </div>
                        <div className="small text-muted text-truncate" style={{ maxWidth: '280px' }}>
                          <i className="bi bi-geo-alt me-1"></i>{c.campusLocation}
                        </div>
                      </td>
                      <td>
                        <div className="small fw-semibold text-dark">{c.studentName}</div>
                        <div className="small text-muted">{c.studentEmail}</div>
                      </td>
                      <td>
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="small">
                        {c.dueDate ? (
                          <span className={c.overdue ? 'text-danger fw-bold' : 'text-muted'}>
                            {new Date(c.dueDate).toLocaleDateString()}
                            {c.overdue && <i className="bi bi-clock-fill text-danger ms-1" title="Overdue"></i>}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td>
                        <Link to={`/staff/complaint/${c.id}`} className="btn btn-sm btn-navy px-3">
                          Update / Resolve
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
