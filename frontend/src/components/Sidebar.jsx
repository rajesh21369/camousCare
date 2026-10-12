import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`sidebar ${isOpen ? 'show' : ''}`}
        style={{
          transform: isOpen || window.innerWidth >= 992 ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Brand Header */}
        <Link to="/" className="sidebar-brand">
          <div
            className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shadow"
            style={{ width: '40px', height: '40px' }}
          >
            <i className="bi bi-shield-check fs-5"></i>
          </div>
          <div>
            <div className="fw-bold fs-5 text-white" style={{ letterSpacing: '-0.02em', lineHeight: '1.2' }}>
              CampusCare
            </div>
            <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
              Grievance Redressal
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <ul className="sidebar-nav">
          {/* STUDENT ROLE */}
          {role === 'ROLE_STUDENT' && (
            <>
              <div className="sidebar-section-title">Student Portal</div>
              <li className="sidebar-item">
                <NavLink to="/student/dashboard" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-grid-1x2-fill"></i>
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/student/submit-complaint" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-plus-circle-fill"></i>
                  <span>Submit Complaint</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/student/complaints" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-card-checklist"></i>
                  <span>My Complaints</span>
                </NavLink>
              </li>
            </>
          )}

          {/* OFFICER ROLE */}
          {role === 'ROLE_OFFICER' && (
            <>
              <div className="sidebar-section-title">Department Officer</div>
              <li className="sidebar-item">
                <NavLink to="/staff/dashboard" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-speedometer2"></i>
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/staff/assigned" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-inbox-fill"></i>
                  <span>Assigned Complaints</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/staff/department" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-building"></i>
                  <span>Department Overview</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ADMIN ROLE */}
          {role === 'ROLE_ADMIN' && (
            <>
              <div className="sidebar-section-title">Administration</div>
              <li className="sidebar-item">
                <NavLink to="/admin/dashboard" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-speedometer2"></i>
                  <span>Admin Dashboard</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/complaints" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-folder2-open"></i>
                  <span>All Complaints</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/assign" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-person-lines-fill"></i>
                  <span>Complaint Assignment</span>
                </NavLink>
              </li>

              <div className="sidebar-section-title">Master Data</div>
              <li className="sidebar-item">
                <NavLink to="/admin/users" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-people-fill"></i>
                  <span>User Management</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/departments" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-buildings"></i>
                  <span>Departments</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/categories" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-tags-fill"></i>
                  <span>Categories</span>
                </NavLink>
              </li>

              <div className="sidebar-section-title">Analytics & Audit</div>
              <li className="sidebar-item">
                <NavLink to="/admin/reports" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-bar-chart-line-fill"></i>
                  <span>Reports & Analytics</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/audit-logs" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-shield-lock-fill"></i>
                  <span>Audit Logs</span>
                </NavLink>
              </li>
            </>
          )}

          {/* MANAGEMENT ROLE */}
          {role === 'ROLE_MANAGEMENT' && (
            <>
              <div className="sidebar-section-title">Management</div>
              <li className="sidebar-item">
                <NavLink to="/management/dashboard" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-pie-chart-fill"></i>
                  <span>Executive Overview</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/management/escalated" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-exclamation-octagon-fill text-warning"></i>
                  <span>Escalated Issues</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink to="/admin/reports" className="sidebar-link" onClick={onClose}>
                  <i className="bi bi-graph-up-arrow"></i>
                  <span>College Reports</span>
                </NavLink>
              </li>
            </>
          )}

          {/* COMMON LINKS */}
          <div className="sidebar-section-title">Account</div>
          <li className="sidebar-item">
            <NavLink to="/track" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-search"></i>
              <span>Track by Number</span>
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/notifications" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-bell-fill"></i>
              <span>Notifications</span>
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/profile" className="sidebar-link" onClick={onClose}>
              <i className="bi bi-person-circle"></i>
              <span>Profile Settings</span>
            </NavLink>
          </li>
        </ul>

        {/* Sidebar Footer */}
        <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
          <button
            onClick={handleLogout}
            className="btn btn-outline-light w-100 btn-sm d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
