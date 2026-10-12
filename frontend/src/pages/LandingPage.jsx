import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function LandingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const [deptRes, catRes] = await Promise.all([
          api.get('/departments'),
          api.get('/categories'),
        ]);
        if (deptRes.success) setDepartments(deptRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (err) {
        // Fallback gracefully
      }
    };
    loadPublicData();
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackingNumber.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Top Header */}
      <header className="bg-white border-bottom py-3 sticky-top shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="rounded-3 bg-navy text-white p-2 d-flex align-items-center justify-content-center shadow-sm">
              <i className="bi bi-shield-check fs-4"></i>
            </div>
            <div>
              <span className="fw-bold fs-4 text-navy" style={{ letterSpacing: '-0.02em' }}>
                CampusCare
              </span>
              <span className="badge bg-primary-subtle text-primary ms-2 d-none d-sm-inline">
                College Grievance Portal
              </span>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <Link to="/track" className="btn btn-outline-secondary btn-sm px-3">
              <i className="bi bi-search me-1"></i> Track
            </Link>
            <Link to="/login" className="btn btn-navy btn-sm px-3">
              <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm px-3">
              Register Student
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-navy text-white py-5 position-relative overflow-hidden">
        <div className="container py-4 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 text-uppercase fw-semibold" style={{ letterSpacing: '0.05em' }}>
                Official College Grievance Redressal System
              </span>
              <h1 className="display-4 fw-extrabold mb-3" style={{ lineHeight: '1.15' }}>
                Fast, Transparent & Accountable Campus Solutions.
              </h1>
              <p className="lead text-light opacity-90 mb-4" style={{ fontSize: '1.15rem' }}>
                Register campus complaints, track real-time resolution stages with your unique ID,
                collaborate with officers, and rate the resolution quality.
              </p>

              {/* Quick Tracker Box */}
              <div className="card shadow-lg border-0 p-3 bg-white" style={{ borderRadius: '16px', maxWidth: '580px' }}>
                <form onSubmit={handleTrackSubmit}>
                  <label className="form-label text-dark fw-semibold small mb-2">
                    <i className="bi bi-search text-primary me-1"></i> Quick Complaint Tracking:
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg border-primary border-opacity-25"
                      placeholder="e.g. CMP-2026-0001"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-navy btn-lg px-4">
                      Track Status
                    </button>
                  </div>
                  <div className="form-text small text-muted mt-1">
                    Check current status, assigned department, and public updates without signing in.
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-5">
              {/* Feature Highlights Grid */}
              <div className="row g-3">
                <div className="col-6">
                  <div className="card-custom p-3 bg-white text-dark h-100 shadow-sm border-0">
                    <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-2 d-inline-flex mb-2">
                      <i className="bi bi-lightning-charge-fill fs-4"></i>
                    </div>
                    <h6 className="fw-bold mb-1">Guaranteed SLA</h6>
                    <p className="small text-muted mb-0">Every category has defined resolution turnaround days.</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card-custom p-3 bg-white text-dark h-100 shadow-sm border-0">
                    <div className="rounded-3 bg-success bg-opacity-10 text-success p-2 d-inline-flex mb-2">
                      <i className="bi bi-shield-lock-fill fs-4"></i>
                    </div>
                    <h6 className="fw-bold mb-1">Private & Safe</h6>
                    <p className="small text-muted mb-0">Role-based access protects student identity and internal notes.</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card-custom p-3 bg-white text-dark h-100 shadow-sm border-0">
                    <div className="rounded-3 bg-warning bg-opacity-10 text-warning p-2 d-inline-flex mb-2">
                      <i className="bi bi-bell-fill fs-4"></i>
                    </div>
                    <h6 className="fw-bold mb-1">Live Alerts</h6>
                    <p className="small text-muted mb-0">In-app notifications on every status change and assignment.</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card-custom p-3 bg-white text-dark h-100 shadow-sm border-0">
                    <div className="rounded-3 bg-info bg-opacity-10 text-info p-2 d-inline-flex mb-2">
                      <i className="bi bi-star-fill fs-4"></i>
                    </div>
                    <h6 className="fw-bold mb-1">Feedback Loop</h6>
                    <p className="small text-muted mb-0">Students rate resolution quality and reopen unresolved issues.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Access Cards */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Choose Your Portal
            </span>
            <h2 className="fw-bold text-navy mt-1">Multi-Role Grievance Management Architecture</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '640px' }}>
              Tailored dashboards with server-side authorization ensuring confidentiality, transparency, and accountability.
            </p>
          </div>

          <div className="row g-4">
            {/* Student */}
            <div className="col-md-6 col-lg-3">
              <div className="card-custom p-4 h-100 d-flex flex-column text-center">
                <div className="rounded-circle bg-primary-subtle text-primary mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-mortarboard-fill fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Student</h5>
                <p className="text-muted small flex-grow-1">
                  Lodge complaints with photos, track step-by-step progress, reply to inquiries, and rate service.
                </p>
                <Link to="/login" className="btn btn-outline-navy btn-sm w-100 mt-2">
                  Student Sign In
                </Link>
              </div>
            </div>

            {/* Officer */}
            <div className="col-md-6 col-lg-3">
              <div className="card-custom p-4 h-100 d-flex flex-column text-center">
                <div className="rounded-circle bg-info-subtle text-info mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-person-badge-fill fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Department Officer</h5>
                <p className="text-muted small flex-grow-1">
                  Investigate complaints, request details, post public updates & confidential notes, resolve tickets.
                </p>
                <Link to="/login" className="btn btn-outline-navy btn-sm w-100 mt-2">
                  Officer Sign In
                </Link>
              </div>
            </div>

            {/* Admin */}
            <div className="col-md-6 col-lg-3">
              <div className="card-custom p-4 h-100 d-flex flex-column text-center">
                <div className="rounded-circle bg-warning-subtle text-warning mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-sliders fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Administrator</h5>
                <p className="text-muted small flex-grow-1">
                  Dispatch complaints, manage officers, configure categories & departments, monitor overdue SLAs.
                </p>
                <Link to="/login" className="btn btn-outline-navy btn-sm w-100 mt-2">
                  Admin Sign In
                </Link>
              </div>
            </div>

            {/* Management */}
            <div className="col-md-6 col-lg-3">
              <div className="card-custom p-4 h-100 d-flex flex-column text-center">
                <div className="rounded-circle bg-success-subtle text-success mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-graph-up fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Principal / Mgmt</h5>
                <p className="text-muted small flex-grow-1">
                  College-wide satisfaction metrics, overdue escalation watchlist, and departmental performance.
                </p>
                <Link to="/login" className="btn btn-outline-navy btn-sm w-100 mt-2">
                  Management Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Departments Overview */}
      <section className="py-5 bg-light border-top">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6">
              <h4 className="fw-bold text-navy mb-3">Covered Complaint Categories</h4>
              <div className="row g-2">
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <div key={c.id} className="col-sm-6">
                      <div className="p-2 bg-white rounded border d-flex align-items-center gap-2">
                        <i className="bi bi-check-circle-fill text-success small"></i>
                        <span className="small fw-semibold text-dark">{c.name}</span>
                        <span className="badge bg-light text-muted ms-auto">{c.slaDays}d SLA</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">Loading campus categories...</p>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <h4 className="fw-bold text-navy mb-3">Participating Campus Departments</h4>
              <div className="row g-2">
                {departments.length > 0 ? (
                  departments.map((d) => (
                    <div key={d.id} className="col-sm-6">
                      <div className="p-2 bg-white rounded border d-flex align-items-center gap-2">
                        <i className="bi bi-building text-primary small"></i>
                        <div className="text-truncate">
                          <div className="small fw-semibold text-dark text-truncate">{d.name}</div>
                          <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.68rem' }}>{d.code}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">Loading campus departments...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark text-white py-4 mt-auto border-top border-secondary border-opacity-25">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="small text-secondary">
            &copy; {new Date().getFullYear()} CampusCare &bull; Online College Complaint Registration and Tracking System.
          </div>
          <div className="d-flex gap-3 small text-secondary">
            <Link to="/track" className="text-secondary text-decoration-none hover-white">Track Complaint</Link>
            <Link to="/login" className="text-secondary text-decoration-none hover-white">Portal Sign In</Link>
            <Link to="/register" className="text-secondary text-decoration-none hover-white">Student Registration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
