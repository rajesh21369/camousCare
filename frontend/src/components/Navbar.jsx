import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail on poll
    }
  };

  const handleOpenNotifications = async () => {
    setShowNotifDropdown(!showNotifDropdown);
    setShowUserDropdown(false);
    if (!showNotifDropdown) {
      try {
        const res = await api.get('/notifications');
        if (res.success && res.data) {
          setNotifications(res.data.slice(0, 5)); // Show latest 5
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ROLE_STUDENT': return 'Student';
      case 'ROLE_OFFICER': return 'Department Officer';
      case 'ROLE_ADMIN': return 'Administrator';
      case 'ROLE_MANAGEMENT': return 'Management';
      default: return role || 'User';
    }
  };

  return (
    <header className="main-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-light d-lg-none text-navy"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <span className="fw-semibold text-secondary d-none d-sm-inline" style={{ fontSize: '0.9rem' }}>
          College Complaint Registration & Tracking Portal
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-light position-relative rounded-circle p-2"
            onClick={handleOpenNotifications}
            style={{ width: '40px', height: '40px' }}
            title="Notifications"
          >
            <i className="bi bi-bell text-secondary fs-5"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.68rem' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              className="position-absolute end-0 mt-2 card-custom shadow-lg p-0"
              style={{ width: '320px', zIndex: 1100, borderRadius: '12px', overflow: 'hidden' }}
            >
              <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Notifications</span>
                <Link
                  to="/notifications"
                  className="small text-primary text-decoration-none"
                  onClick={() => setShowNotifDropdown(false)}
                >
                  View All
                </Link>
              </div>
              <div className="list-group list-group-flush" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted small">No notifications found</div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={n.relatedComplaintId ? `/complaints/${n.relatedComplaintId}` : '/notifications'}
                      className={`list-group-item list-group-item-action p-2 text-decoration-none ${!n.read ? 'bg-light' : ''}`}
                      onClick={() => setShowNotifDropdown(false)}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <i className={`bi mt-1 ${!n.read ? 'bi-circle-fill text-primary' : 'bi-check2 text-muted'}`} style={{ fontSize: '0.6rem' }}></i>
                        <div>
                          <div className="fw-semibold text-dark small">{n.title}</div>
                          <div className="text-secondary" style={{ fontSize: '0.78rem' }}>{n.message}</div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-light d-flex align-items-center gap-2 px-2 py-1 border rounded-pill"
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifDropdown(false);
            }}
          >
            <div
              className="rounded-circle bg-navy text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-start d-none d-md-block pe-1">
              <div className="fw-semibold text-dark small" style={{ lineHeight: '1.1' }}>
                {user?.fullName || user?.username}
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.65rem' }}>
                {getRoleDisplayName(user?.role)}
              </span>
            </div>
            <i className="bi bi-chevron-down text-muted small"></i>
          </button>

          {showUserDropdown && (
            <div
              className="position-absolute end-0 mt-2 card-custom shadow-lg py-1"
              style={{ width: '210px', zIndex: 1100, borderRadius: '10px' }}
            >
              <div className="px-3 py-2 border-bottom">
                <div className="fw-bold small text-dark">{user?.fullName}</div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
              </div>
              <Link
                to="/profile"
                className="dropdown-item px-3 py-2 text-dark small d-flex align-items-center gap-2"
                onClick={() => setShowUserDropdown(false)}
              >
                <i className="bi bi-person"></i> My Profile
              </Link>
              <div className="dropdown-divider my-1"></div>
              <button
                className="dropdown-item px-3 py-2 text-danger small d-flex align-items-center gap-2"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
