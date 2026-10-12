import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend
);

// Helper: convert Map<String,Long> from backend into [{name, count}] arrays
function mapToArray(obj) {
  if (!obj) return [];
  return Object.entries(obj).map(([name, count]) => ({ name, count }));
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.success) setStats(res.data);
    } catch {
      showToast('Failed to load dashboard stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Convert backend Maps → arrays for chart rendering
  const deptArray = mapToArray(stats?.departmentWiseCounts);
  const catArray  = mapToArray(stats?.categoryWiseCounts);
  const avgDays   = stats?.averageResolutionHours
    ? (stats.averageResolutionHours / 24).toFixed(1)
    : null;

  const statCards = stats ? [
    { label: 'Total Complaints', value: stats.totalComplaints, icon: 'bi-collection', color: 'primary', link: '/admin/complaints' },
    { label: 'Pending Review', value: stats.submittedComplaints, icon: 'bi-hourglass-split', color: 'warning', link: '/admin/complaints?status=SUBMITTED' },
    { label: 'In Progress', value: stats.inProgressComplaints, icon: 'bi-arrow-repeat', color: 'info', link: '/admin/complaints?status=IN_PROGRESS' },
    { label: 'Resolved', value: stats.resolvedComplaints, icon: 'bi-check-circle', color: 'success', link: '/admin/complaints?status=RESOLVED' },
    { label: 'Overdue', value: stats.overdueComplaints, icon: 'bi-exclamation-triangle', color: 'danger', link: '/admin/complaints?overdue=true' },
    { label: 'Avg Resolution', value: avgDays ? `${avgDays}d` : 'N/A', icon: 'bi-clock-history', color: 'secondary', link: '/admin/reports' },
  ] : [];

  // Chart data objects
  const departmentChart = deptArray.length > 0 ? {
    labels: deptArray.map(d => d.name),
    datasets: [{
      label: 'Complaints',
      data: deptArray.map(d => d.count),
      backgroundColor: [
        '#1a365d','#2b5c9a','#4a90d9','#6baed6','#9ecae1','#c6dbef',
        '#08519c','#2171b5','#4292c6',
      ],
      borderWidth: 1,
      borderRadius: 4,
    }],
  } : null;

  const categoryChart = catArray.length > 0 ? {
    labels: catArray.map(c => c.name.length > 18 ? c.name.substring(0, 15) + '…' : c.name),
    datasets: [{
      data: catArray.map(c => c.count),
      backgroundColor: [
        '#1a365d','#2b5c9a','#4a90d9','#6baed6','#9ecae1',
        '#c6dbef','#08519c','#2171b5','#4292c6','#6baed6',
      ],
    }],
  } : null;

  const monthlyChart = stats?.monthlyTrends?.length > 0 ? {
    labels: stats.monthlyTrends.map(m => m.month),
    datasets: [
      {
        label: 'Submitted',
        data: stats.monthlyTrends.map(m => m.submitted),
        borderColor: '#4a90d9',
        backgroundColor: 'rgba(74,144,217,0.15)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Resolved',
        data: stats.monthlyTrends.map(m => m.resolved),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="text-muted small">Loading admin dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="card-custom bg-navy text-white p-4 mb-4 border-0">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <span className="badge bg-danger px-3 py-1 rounded-pill mb-2">Admin Control Panel</span>
            <h3 className="fw-bold mb-1">Admin Dashboard</h3>
            <p className="text-light opacity-75 mb-0 small">
              College-wide complaint overview, analytics and system health.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/admin/assign" className="btn btn-primary btn-sm">
              <i className="bi bi-person-check me-1"></i>Assign Complaints
            </Link>
            <Link to="/admin/reports" className="btn btn-outline-light btn-sm">
              <i className="bi bi-bar-chart me-1"></i>Full Reports
            </Link>
            <button onClick={fetchStats} className="btn btn-outline-light btn-sm">
              <i className="bi bi-arrow-clockwise me-1"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-2">
            <Link to={card.link} className="text-decoration-none">
              <div className="stat-card card h-100 border-0 shadow-sm" style={{ cursor: 'pointer' }}>
                <div className="card-body p-3 text-center">
                  <div className="mb-2">
                    <i className={`${card.icon} fs-2 text-${card.color}`}></i>
                  </div>
                  <div className={`fw-bold fs-4 text-${card.color}`}>{card.value}</div>
                  <div className="text-muted small">{card.label}</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card-custom mb-4">
        <div className="card-header-clean">
          <h6 className="mb-0 fw-bold text-dark">Quick Actions</h6>
        </div>
        <div className="card-body p-3">
          <div className="row g-3">
            {[
              { to: '/admin/users', icon: 'bi-people', label: 'Manage Users', color: 'primary', desc: 'Add, edit or disable accounts' },
              { to: '/admin/departments', icon: 'bi-building', label: 'Departments', color: 'info', desc: 'Manage college departments' },
              { to: '/admin/categories', icon: 'bi-tags', label: 'Categories', color: 'success', desc: 'Configure issue categories' },
              { to: '/admin/assign', icon: 'bi-person-check', label: 'Assign Complaints', color: 'warning', desc: 'Route unassigned tickets' },
              { to: '/admin/complaints', icon: 'bi-list-check', label: 'All Complaints', color: 'secondary', desc: 'Browse all complaint records' },
              { to: '/admin/audit-logs', icon: 'bi-shield-lock', label: 'Audit Logs', color: 'danger', desc: 'Track system activity' },
            ].map((action, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-2">
                <Link to={action.to} className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm text-center p-3" style={{ transition: 'transform 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className={`${action.icon} fs-2 text-${action.color} mb-1 d-block`}></i>
                    <div className="small fw-semibold text-dark">{action.label}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{action.desc}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      {stats && (
        <div className="row g-4 mb-4">
          {/* Monthly Trend */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-semibold">
                  <i className="bi bi-graph-up me-2 text-primary"></i>Monthly Complaint Trends (Last 6 Months)
                </h6>
              </div>
              <div className="card-body">
                {monthlyChart ? (
                  <Line
                    data={monthlyChart}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    }}
                    height={110}
                  />
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-graph-up display-6 opacity-25"></i>
                    <p className="mt-2 small">No trend data available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Pie */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-semibold">
                  <i className="bi bi-pie-chart me-2 text-primary"></i>Complaints by Category
                </h6>
              </div>
              <div className="card-body d-flex align-items-center justify-content-center">
                {categoryChart ? (
                  <Pie
                    data={categoryChart}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } },
                    }}
                  />
                ) : (
                  <p className="text-muted small">No data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Bar Chart */}
      {stats && departmentChart && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-bottom">
            <h6 className="mb-0 fw-semibold">
              <i className="bi bi-bar-chart me-2 text-primary"></i>Department-wise Complaint Distribution
            </h6>
          </div>
          <div className="card-body">
            <Bar
              data={departmentChart}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
              height={70}
            />
          </div>
        </div>
      )}

      {/* Status Breakdown + Department Table */}
      {stats && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-semibold">
                  <i className="bi bi-pie-chart me-2 text-primary"></i>Status Breakdown
                </h6>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm mb-0">
                  <tbody>
                    {[
                      { label: 'Submitted', value: stats.submittedComplaints, status: 'SUBMITTED' },
                      { label: 'Under Review', value: stats.underReviewComplaints, status: 'UNDER_REVIEW' },
                      { label: 'Assigned', value: stats.assignedComplaints, status: 'ASSIGNED' },
                      { label: 'In Progress', value: stats.inProgressComplaints, status: 'IN_PROGRESS' },
                      { label: 'Resolved', value: stats.resolvedComplaints, status: 'RESOLVED' },
                      { label: 'Closed', value: stats.closedComplaints, status: 'CLOSED' },
                      { label: 'Escalated', value: stats.escalatedComplaints, status: 'ESCALATED' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="ps-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="text-end fw-semibold">{row.value ?? 0}</td>
                        <td className="pe-3" style={{ width: '100px' }}>
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-primary"
                              style={{
                                width: `${stats.totalComplaints ? ((row.value ?? 0) / stats.totalComplaints * 100) : 0}%`
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-semibold">
                  <i className="bi bi-building me-2 text-primary"></i>Top Departments by Volume
                </h6>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Department</th>
                      <th className="text-end pe-3">Complaints</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptArray.length > 0 ? (
                      deptArray.slice(0, 6).map((d, i) => (
                        <tr key={i}>
                          <td className="ps-3">
                            <span className="fw-semibold small">{d.name}</span>
                          </td>
                          <td className="text-end pe-3">
                            <span className="badge bg-primary">{d.count}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={2} className="text-center text-muted py-3 small">No department data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {!stats && (
        <div className="card-custom p-5 text-center">
          <i className="bi bi-bar-chart display-4 text-muted opacity-50"></i>
          <h5 className="mt-3 text-muted">No Data Available</h5>
          <p className="text-muted small">Analytics data will appear once complaints are registered in the system.</p>
          <button className="btn btn-primary btn-sm" onClick={fetchStats}>
            <i className="bi bi-arrow-clockwise me-1"></i>Retry
          </button>
        </div>
      )}
    </div>
  );
}
