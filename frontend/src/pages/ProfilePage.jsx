import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { user, updateProfileState } = useAuth();
  const { showSuccess, showError } = useToast();

  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.success && res.data) {
        setProfile(res.data);
        setPhone(res.data.phone || '');
        setFullName(res.data.fullName || '');
      }
    } catch (err) {
      showError('Failed to load profile details');
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await api.put('/users/me', {
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      if (res.success) {
        showSuccess('Contact details updated successfully');
        updateProfileState({ fullName: fullName.trim(), phone: phone.trim() });
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setChangingPass(true);
    try {
      const res = await api.put('/users/me/password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        showSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showError(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_STUDENT': return <span className="badge bg-primary">Student</span>;
      case 'ROLE_OFFICER': return <span className="badge bg-info text-dark">Department Officer</span>;
      case 'ROLE_ADMIN': return <span className="badge bg-warning text-dark">Administrator</span>;
      case 'ROLE_MANAGEMENT': return <span className="badge bg-success">Management</span>;
      default: return <span className="badge bg-secondary">{role}</span>;
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-navy mb-1">My Account & Profile Settings</h3>
        <p className="text-muted small mb-0">View account metadata, modify contact details, and update your password.</p>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-5">
          <div className="card-custom p-4 bg-white text-center mb-4">
            <div
              className="rounded-circle bg-navy text-white d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-2 shadow-sm"
              style={{ width: '80px', height: '80px' }}
            >
              {profile?.fullName ? profile.fullName.charAt(0) : 'U'}
            </div>
            <h5 className="fw-bold text-dark mb-1">{profile?.fullName}</h5>
            <div className="text-muted small mb-2">{profile?.email}</div>
            <div className="mb-3">{getRoleBadge(profile?.role)}</div>

            <ul className="list-unstyled text-start border-top pt-3 mb-0 small" style={{ lineHeight: '2' }}>
              <li className="d-flex justify-content-between">
                <span className="text-muted">Username:</span>
                <span className="fw-semibold text-dark">{profile?.username}</span>
              </li>
              <li className="d-flex justify-content-between">
                <span className="text-muted">ID / Roll No:</span>
                <span className="fw-semibold text-dark">{profile?.studentOrStaffId || 'N/A'}</span>
              </li>
              <li className="d-flex justify-content-between">
                <span className="text-muted">Department:</span>
                <span className="fw-semibold text-dark">{profile?.departmentName || 'General'}</span>
              </li>
              <li className="d-flex justify-content-between">
                <span className="text-muted">Member Since:</span>
                <span className="text-dark">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Update Forms */}
        <div className="col-lg-7">
          {/* Edit Contact Form */}
          <div className="card-custom p-4 bg-white mb-4">
            <h5 className="fw-bold text-navy mb-3">Update Personal Details</h5>
            <form onSubmit={handleUpdateContact}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-navy btn-sm px-4 mt-3"
                disabled={updatingProfile}
              >
                {updatingProfile ? 'Saving...' : 'Save Details'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card-custom p-4 bg-white">
            <h5 className="fw-bold text-navy mb-3">Security & Password</h5>
            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">Current Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark">New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark">Confirm New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-outline-danger btn-sm px-4"
                disabled={changingPass}
              >
                {changingPass ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
