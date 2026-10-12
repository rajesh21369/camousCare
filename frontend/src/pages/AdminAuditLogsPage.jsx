import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs');
      if (res.success) setLogs(res.data?.content || res.data || []);
    } catch {
      showToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(log =>
    !search ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.username?.toLowerCase().includes(search.toLowerCase()) ||
    log.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container fade-in">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-1 fw-bold">Security & System Audit Logs</h4>
          <p className="text-muted mb-0">Track compliance, actions, assignments, and logins</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchLogs}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-2">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Filter by user, action, details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 font-monospace" style={{ fontSize: '0.85rem' }}>
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Timestamp</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Target ID</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log.id}>
                      <td className="ps-3 text-muted">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="fw-semibold text-primary">{log.username || 'Anonymous'}</td>
                      <td>
                        <span className="badge bg-secondary">{log.role || 'GUEST'}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{log.action}</span>
                      </td>
                      <td className="text-muted">{log.targetId || '—'}</td>
                      <td className="text-break">{log.details || '—'}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">No audit logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
