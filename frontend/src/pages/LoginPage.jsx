import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      showSuccess(`Welcome back, ${user.fullName || user.username}!`);

      // Route based on role
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from);
      } else {
        switch (user.role) {
          case 'ROLE_STUDENT':
            navigate('/student/dashboard');
            break;
          case 'ROLE_OFFICER':
            navigate('/staff/dashboard');
            break;
          case 'ROLE_ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'ROLE_MANAGEMENT':
            navigate('/management/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      showError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5 px-3">
      {/* Brand Header */}
      <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-4">
        <div className="rounded-3 bg-navy text-white p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '42px', height: '42px' }}>
          <i className="bi bi-shield-check fs-4"></i>
        </div>
        <span className="fw-bold fs-3 text-navy" style={{ letterSpacing: '-0.02em' }}>
          CampusCare
        </span>
      </Link>

      <div className="card-custom p-4 p-md-5 bg-white shadow-sm" style={{ width: '100%', maxWidth: '460px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold text-dark">Portal Sign In</h3>
          <p className="text-muted small">Enter your credentials to access your college dashboard</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold small text-dark">Username or Email</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="e.g. student1, admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-semibold small text-dark mb-0">Password</label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-key"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-navy w-100 py-2 fw-semibold mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center small text-muted mb-4">
          Are you a new student?{' '}
          <Link to="/register" className="text-primary fw-semibold text-decoration-none">
            Register Account
          </Link>
        </div>

        {/* Demo Fast-Fill Buttons */}
        <div className="border-top pt-3">
          <div className="small fw-bold text-uppercase text-muted mb-2 text-center" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
            Quick Demo Accounts (1-Click Fill)
          </div>
          <div className="row g-2">
            <div className="col-6">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100 text-truncate text-start px-2 py-1"
                onClick={() => handleQuickDemo('student1', 'Password@123')}
              >
                <i className="bi bi-mortarboard text-primary me-1"></i> Student
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100 text-truncate text-start px-2 py-1"
                onClick={() => handleQuickDemo('officer_it', 'Password@123')}
              >
                <i className="bi bi-person-badge text-info me-1"></i> Officer (IT)
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100 text-truncate text-start px-2 py-1"
                onClick={() => handleQuickDemo('admin', 'Password@123')}
              >
                <i className="bi bi-sliders text-warning me-1"></i> Admin
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100 text-truncate text-start px-2 py-1"
                onClick={() => handleQuickDemo('principal', 'Password@123')}
              >
                <i className="bi bi-award text-success me-1"></i> Management
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link to="/" className="text-muted small text-decoration-none">
          <i className="bi bi-arrow-left me-1"></i> Return to CampusCare Home
        </Link>
      </div>
    </div>
  );
}
