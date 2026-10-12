import React, { useState, useEffect } from 'react';
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

export default function AdminReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.success) setStats(res.data);
    } catch {
      showToast('Failed to load reports and analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deptArray = mapToArray(stats?.departmentWiseCounts);
  const catArray  = mapToArray(stats?.categoryWiseCounts);
  const priArray  = mapToArray(stats?.priorityWiseCounts);

  const avgDays = stats?.averageResolutionHours
    ? (stats.averageResolutionHours / 24).toFixed(1)
    : null;

  const resolutionRate = stats?.totalComplaints
    ? Math.round(((stats.resolvedComplaints + stats.closedComplaints) / stats.totalComplaints) * 100)
    : 0;

  const overdueRate = stats?.totalComplaints
    ? Math.round((stats.overdueComplaints / stats.totalComplaints) * 100)
    : 0;

  const departmentChart = deptArray.length > 0 ? {
    labels: deptArray.map(d => d.name),
    datasets: [{
      label: 'Total Complaints',
      data: deptArray.map(d => d.count),
      backgroundColor: '#1a365d',
      borderRadius: 4,
    }],
  } : null;

  const categoryChart = catArray.length > 0 ? {
    labels: catArray.map(c => c.name.length > 20 ? c.name.substring(0, 17) + '…' : c.name),
    datasets: [{
      data: catArray.map(c => c.count),
      backgroundColor: [
        '#1a365d', '#2b5c9a', '#4a90d9', '#6baed6', '#9ecae1',
        '#c6dbef', '#08519c', '#2171b5', '#4292c6', '#74c476'
      ],
    }],
  } : null;

  const priorityChart = priArray.length > 0 ? {
    labels: priArray.map(p => p.name),
    datasets: [{
      data: priArray.map(p => p.count),
      backgroundColor: ['#dc2626', '#f97316', '#eab308', '#22c55e'],
    }],
  } : null;

  const monthlyChart = stats?.monthlyTrends?.length > 0 ? {
    labels: stats.monthlyTrends.map(m => m.month),
    datasets: [
      {
        label: 'Submitted',
        data: stats.monthlyTrends.map(m => m.submitted),
        borderColor: '#2b5c9a',
        backgroundColor: 'rgba(43, 92, 154, 0.12)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Resolved',
        data: stats.monthlyTrends.map(m => m.resolved),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.08)',
        fill: true,
        tension: 0.3,
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
          <div className="text-muted small">Loading reports & analytics…</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-1 fw-bold">Reports &amp; Analytics</h4>
          <p className="text-muted mb-0">Deep-dive performance metrics and resolution breakdowns</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchAnalytics}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh Data
        </button>
      </div>

      {/* KPI Summary Row */}
      <div className="row g-3 mb-4">
        {[
          {
            label: 'Total Complaints', value: stats?.totalComplaints ?? 0,
            icon: 'bi-collection', color: 'primary',
          },
          {
            label: 'Resolution Rate', value: `${resolutionRate}%`,
            icon: 'bi-check2-all', color: 'success',
          },
          {
            label: 'Avg Resolution Time', value: avgDays ? `${avgDays} days` : 'N/A',
            icon: 'bi-clock-history', color: 'info',
          },
          {
            label: 'Overdue Rate', value: `${overdueRate}%`,
            icon: 'bi-exclamation-triangle', color: 'danger',
          },
          {
            label: 'Satisfaction Rating', value: stats?.overallSatisfactionRating
              ? `${stats.overallSatisfactionRating} / 5`
              : 'N/A',
            icon: 'bi-star-half', color: 'warning',
          },
          {
            label: 'Feedback Received', value: stats?.totalFeedbackReceived ?? 0,
            icon: 'bi-chat-dots', color: 'secondary',
          },
        ].map((kpi, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-2">
            <div className="card shadow-sm border-0 text-center p-3 h-100">
              <i className={`${kpi.icon} fs-2 text-${kpi.color} mb-2`}></i>
              <div className={`fs-4 fw-bold text-${kpi.color}`}>{kpi.value}</div>
              <div className="text-muted small">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Trend Chart */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-bottom fw-semibold">
          <i className="bi bi-graph-up me-2 text-primary"></i>Historical Volume — Monthly Trend (Last 6 Months)
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
              height={80}
            />
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-graph-up display-6 opacity-25"></i>
              <p className="mt-2 small">No trend data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Dept Bar + Category Pie */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-bar-chart me-2 text-primary"></i>Complaints by Department
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
                <p className="text-muted text-center py-4 small">No department data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-pie-chart me-2 text-primary"></i>Complaints by Category
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
                <p className="text-muted small">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Pie + Status Summary Table */}
      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-flag me-2 text-primary"></i>Complaints by Priority
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              {priorityChart ? (
                <Pie
                  data={priorityChart}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                  }}
                />
              ) : (
                <p className="text-muted small">No data</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-table me-2 text-primary"></i>Department Summary Table
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">#</th>
                      <th>Department</th>
                      <th className="text-end pe-3">Total Complaints</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptArray.length > 0 ? (
                      deptArray
                        .sort((a, b) => b.count - a.count)
                        .map((d, i) => (
                          <tr key={i}>
                            <td className="ps-3 text-muted small">{i + 1}</td>
                            <td className="fw-semibold small">{d.name}</td>
                            <td className="text-end pe-3">
                              <span className="badge bg-primary">{d.count}</span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3 small">
                          No department data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
