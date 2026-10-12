import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      showError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      // quiet fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showSuccess('All notifications marked as read');
    } catch (err) {
      showError('Failed to mark all as read');
    }
  };

  const displayedList = filterUnread
    ? notifications.filter((n) => !n.read)
    : notifications;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SUBMISSION': return 'bi-file-earmark-plus text-primary';
      case 'ASSIGNMENT': return 'bi-person-check text-purple';
      case 'STATUS_UPDATE': return 'bi-arrow-repeat text-info';
      case 'INFO_REQUEST': return 'bi-question-circle text-warning';
      case 'INFO_UPDATE': return 'bi-reply-fill text-primary';
      case 'RESOLUTION': return 'bi-check-circle-fill text-success';
      case 'ESCALATION': return 'bi-exclamation-triangle-fill text-danger';
      case 'FEEDBACK': return 'bi-star-fill text-warning';
      default: return 'bi-bell-fill text-secondary';
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-navy mb-1">Notifications & Activity Feed</h3>
          <p className="text-muted small mb-0">
            Real-time updates regarding your complaint status, staff replies, and assignments.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${filterUnread ? 'btn-navy' : 'btn-outline-secondary'}`}
            onClick={() => setFilterUnread(!filterUnread)}
          >
            {filterUnread ? 'Show All' : 'Show Unread Only'}
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleMarkAllRead}
            disabled={notifications.every((n) => n.read)}
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="card-custom bg-white">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="text-muted small mt-2">Loading notifications...</div>
            </div>
          ) : displayedList.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-bell-slash text-muted display-4"></i>
              <p className="text-muted mt-2">No notifications found.</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {displayedList.map((item) => (
                <div
                  key={item.id}
                  className={`list-group-item p-3 d-flex align-items-start gap-3 transition-all ${!item.read ? 'bg-light' : ''}`}
                >
                  <div className="fs-4 mt-1">
                    <i className={`bi ${getTypeIcon(item.type)}`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="fw-bold text-dark mb-1">{item.title}</h6>
                      <small className="text-muted">
                        {new Date(item.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <p className="text-secondary small mb-2">{item.message}</p>
                    <div className="d-flex align-items-center gap-3">
                      {item.relatedComplaintId && (
                        <Link
                          to={`/complaints/${item.relatedComplaintId}`}
                          className="btn btn-sm btn-outline-primary py-0 px-2"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleMarkAsRead(item.id)}
                        >
                          View Complaint ({item.trackingNumber})
                        </Link>
                      )}
                      {!item.read && (
                        <button
                          type="button"
                          className="btn btn-link text-muted p-0 small text-decoration-none"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleMarkAsRead(item.id)}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
