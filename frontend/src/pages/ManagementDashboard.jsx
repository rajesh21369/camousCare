import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
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
  Legend
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

export default function ManagementDashboard() {
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
      showToast('Failed to load management overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deptArray = mapToArray(stats?.departmentWiseCounts);
  const catArray  = mapToArray(stats?.categoryWiseCounts);

  const avgDays = stats?.averageResolutionHours
    ? (stats.averageResolutionHours / 24).toFixed(1)
    : null;

  const resolutionRate = stats?.totalComplaints
    ? Math.round(((stats.resolvedComplaints + stats.closedComplaints) / stats.totalComplaints) * 100)
    : 0;

  const departmentChart = deptArray.length > 0 ? {
    labels: deptArray.map(d => d.name),
    datasets: [{
      label: 'Complaints',
      data: deptArray.map(d => d.count),
      backgroundColor: '#1a365d',
      borderRadius: 4,
    }],
  } : null;

  const categoryChart = catArray.length > 0 ? {
    labels: catArray.map(c => c.name.length > 18 ? c.name.substring(0, 15) + '…' : c.name),
    datasets: [{
      data: catArray.map(c => c.count),
      backgroundColor: [
        '#1a365d', '#2b5c9a', '#4a90d9', '#6baed6', '#9ecae1',
        '#c6dbef', '#08519c', '#2171b5', '#4292c6', '#74c476',
      ],
    }],
  } : null;

  const monthlyChart = stats?.monthlyTrends?.length > 0 ? {
    labels: stats.monthlyTrends.map(m => m.month),
    datasets: [
      {
        label: 'Submitted',
        data: stats.monthlyTrends.map(m => m.submitted),
        borderColor: '#1a365d',
        backgroundColor: 'rgba(26,54,93,0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Resolved',
        data: stats.monthlyTrends.map(m => m.resolved),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.08)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <div className="text-muted small">Loading executive overview…</div>
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
            <span className="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2">Principal / Management</span>
            <h3 className="fw-bold mb-1">Executive Management Dashboard</h3>
            <p className="text-light opacity-75 mb-0 small">
              High-level institutional health &amp; grievance resolution index
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/management/escalated" className="btn btn-danger btn-sm">
              <i className="bi bi-shield-exclamation me-1"></i>
              Review Escalations ({stats?.escalatedComplaints ?? 0})
            </Link>
            <button className="btn btn-outline-light btn-sm" onClick={fetchStats}>
              <i className="bi bi-arrow-clockwise me-1"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {[
          {
            label: 'Total Lodged', value: stats?.totalComplaints ?? 0,
            icon: 'bi-collection', color: 'primary',
            sub: 'All time complaints registered',
          },
          {
            label: 'Resolved & Closed',
            value: (stats?.resolvedComplaints ?? 0) + (stats?.closedComplaints ?? 0),
            icon: 'bi-check2-circle', color: 'success',
            sub: `Resolution Rate: ${resolutionRate}%`,
          },
          {
            label: 'Avg Resolution Time',
            value: avgDays ? `${avgDays} days` : 'N/A',
            icon: 'bi-clock-history', color: 'info',
            sub: 'From submission to resolution',
          },
          {
            label: 'Escalated Grievances', value: stats?.escalatedComplaints ?? 0,
            icon: 'bi-exclamation-octagon', color: 'danger',
            sub: 'Require management attention',
          },
          {
            label: 'SLA Breached (Overdue)', value: stats?.overdueComplaints ?? 0,
            icon: 'bi-clock', color: 'warning',
            sub: 'Past target resolution date',
          },
          {
            label: 'Satisfaction Rating',
            value: stats?.overallSatisfactionRating
              ? `${stats.overallSatisfactionRating} / 5`
              : 'N/A',
            icon: 'bi-star-half', color: 'secondary',
            sub: `Based on ${stats?.totalFeedbackReceived ?? 0} feedback(s)`,
          },
        ].map((kpi, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-2">
            <div className={`card h-100 border-0 shadow-sm border-top border-3 border-${kpi.color} p-3 text-center`}>
              <i className={`${kpi.icon} fs-2 text-${kpi.color} mb-2`}></i>
              <div className={`fw-bold fs-4 text-${kpi.color}`}>{kpi.value}</div>
              <div className="fw-semibold small text-dark mb-1">{kpi.label}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      {monthlyChart && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-bottom fw-semibold">
            <i className="bi bi-graph-up me-2 text-primary"></i>Monthly Complaint Trends (Last 6 Months)
          </div>
          <div className="card-body">
            <Line
              data={monthlyChart}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
              height={90}
            />
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-bar-chart me-2 text-primary"></i>Departmental Workload
            </div>
            <div className="card-body">
              {departmentChart ? (
                <Bar
                  data={departmentChart}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  }}
                />
              ) : (
                <p className="text-muted text-center py-4 small">No department data</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-pie-chart me-2 text-primary"></i>Issue Domain Breakdown
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
                <p className="text-muted small">No data</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Department Performance Ranking */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
          <span className="fw-semibold">
            <i className="bi bi-trophy me-2 text-warning"></i>Department Resolution Performance Ranking
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">#</th>
                  <th>Department</th>
                  <th>Total Registered</th>
                  <th>Workload Share</th>
                  <th>Operational Status</th>
                </tr>
              </thead>
              <tbody>
                {deptArray.length > 0 ? (
                  deptArray
                    .sort((a, b) => b.count - a.count)
                    .map((dept, index) => {
                      const share = stats?.totalComplaints
                        ? Math.round((dept.count / stats.totalComplaints) * 100)
                        : 0;
                      return (
                        <tr key={index}>
                          <td className="ps-3 text-muted small">{index + 1}</td>
                          <td className="fw-semibold">{dept.name}</td>
                          <td>
                            <span className="badge bg-secondary">{dept.count}</span>
                          </td>
                          <td style={{ width: '180px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                <div
                                  className="progress-bar bg-primary"
                                  style={{ width: `${share}%` }}
                                ></div>
                              </div>
                              <span className="small text-muted">{share}%</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              Operational
                            </span>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4 small">
                      No department data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
