import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ProgressTimeline from '../components/ProgressTimeline';

export default function PublicTrackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTrackingNumber(id);
      fetchComplaint(id);
    }
  }, [searchParams]);

  const fetchComplaint = async (num) => {
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const res = await api.get(`/complaints/public/track/${encodeURIComponent(num.trim())}`);
      if (res.success && res.data) {
        setComplaint(res.data);
      } else {
        setError('Complaint not found with tracking ID: ' + num);
      }
    } catch (err) {
      setError(err.message || 'Complaint not found. Please verify the tracking number.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSearchParams({ id: trackingNumber.trim().toUpperCase() });
      fetchComplaint(trackingNumber.trim().toUpperCase());
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Top Navbar */}
      <header className="bg-white border-bottom py-3 shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="rounded-3 bg-navy text-white p-2 d-flex align-items-center justify-content-center">
              <i className="bi bi-shield-check fs-4"></i>
            </div>
            <span className="fw-bold fs-4 text-navy">CampusCare</span>
          </Link>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-navy btn-sm px-3">
              Portal Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm px-3">
              Register Student
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-5 flex-grow-1">
        <div className="text-center mb-5">
          <span className="badge bg-primary px-3 py-1 rounded-pill mb-2">Public Grievance Tracker</span>
          <h2 className="fw-bold text-navy">Track Complaint Status</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '580px' }}>
            Check the real-time progress, assigned department, and resolution timeline of any complaint registered at CampusCare.
          </p>

          {/* Search Box */}
          <div className="card-custom p-3 bg-white mx-auto shadow-sm" style={{ maxWidth: '600px' }}>
            <form onSubmit={handleSearch}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-lg text-uppercase"
                  placeholder="Enter Tracking ID (e.g. CMP-2026-0001)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-navy btn-lg px-4" disabled={loading}>
                  {loading ? 'Searching...' : 'Track'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mx-auto text-center" style={{ maxWidth: '600px' }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {complaint && (
          <div className="card-custom p-4 p-md-5 bg-white mx-auto shadow-sm" style={{ maxWidth: '860px' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 border-bottom mb-4 gap-2">
              <div>
                <span className="font-monospace fw-bold fs-5 text-primary me-2">
                  {complaint.trackingNumber}
                </span>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
              <div className="small text-muted">
                Lodged: {new Date(complaint.submissionDate || complaint.createdAt).toLocaleDateString()}
              </div>
            </div>

            <h4 className="fw-bold text-dark mb-2">{complaint.title}</h4>
            <p className="text-muted mb-4">{complaint.description}</p>

            <div className="row g-3 p-3 bg-light rounded-3 mb-4">
              <div className="col-sm-6 col-md-3">
                <small className="text-muted d-block">Category</small>
                <span className="fw-semibold text-dark small">{complaint.categoryName}</span>
              </div>
              <div className="col-sm-6 col-md-3">
                <small className="text-muted d-block">Department</small>
                <span className="fw-semibold text-dark small">{complaint.departmentName || 'General'}</span>
              </div>
              <div className="col-sm-6 col-md-3">
                <small className="text-muted d-block">Location</small>
                <span className="fw-semibold text-dark small">{complaint.campusLocation}</span>
              </div>
              <div className="col-sm-6 col-md-3">
                <small className="text-muted d-block">Target SLA Due</small>
                <span className="fw-semibold text-dark small">
                  {complaint.dueDate ? new Date(complaint.dueDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <h5 className="fw-bold text-navy mb-3">Resolution Timeline</h5>
            <ProgressTimeline updates={complaint.updates} />
          </div>
        )}
      </main>
    </div>
  );
}
