import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axiosConfig';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    studentId: '',
    departmentId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        if (res.success && res.data) {
          setDepartments(res.data);
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        studentId: formData.studentId.trim(),
        departmentId: formData.departmentId || null,
      };

      const res = await register(payload);
      if (res.success) {
        showSuccess('Account created successfully! Please sign in with your credentials.');
        navigate('/login');
      }
    } catch (err) {
      showError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5 px-3">
      <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-4">
        <div className="rounded-3 bg-navy text-white p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '42px', height: '42px' }}>
          <i className="bi bi-shield-check fs-4"></i>
        </div>
        <span className="fw-bold fs-3 text-navy" style={{ letterSpacing: '-0.02em' }}>
          CampusCare
        </span>
      </Link>

      <div className="card-custom p-4 p-md-5 bg-white shadow-sm" style={{ width: '100%', maxWidth: '580px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold text-dark">Student Registration</h3>
          <p className="text-muted small">Create an account to lodge and track complaints on campus</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold small text-dark">Full Name *</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small text-dark">Student ID / Roll No *</label>
              <input
                type="text"
                name="studentId"
                className="form-control"
                placeholder="e.g. CS-2024-055"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small text-dark">Username *</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Choose username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small text-dark">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="college.email@campuscare.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small text-dark">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small text-dark">Your Department / Branch</label>
              <select
                name="departmentId"
                className="form-select"
                value={formData.departmentId}
                onChange={handleChange}
              >
                <option value="">Select your department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small text-dark">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small text-dark">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-navy w-100 py-2 mt-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <i className="bi bi-person-check-fill"></i>
                <span>Register Student Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center small text-muted mt-3">
          Already registered?{' '}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
