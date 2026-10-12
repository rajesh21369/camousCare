import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

const ROLES = ['ROLE_STUDENT','ROLE_OFFICER','ROLE_ADMIN','ROLE_MANAGEMENT'];
const ROLE_LABELS = {
  ROLE_STUDENT: 'Student',
  ROLE_OFFICER: 'Officer',
  ROLE_ADMIN: 'Admin',
  ROLE_MANAGEMENT: 'Management',
};

const emptyForm = {
  fullName: '', username: '', email: '', phone: '', password: '',
  role: 'ROLE_STUDENT', departmentId: '',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments'),
      ]);
      if (usersRes.success) setUsers(usersRes.data?.content || usersRes.data || []);
      if (deptsRes.success) setDepartments(deptsRes.data || []);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditUser(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'ROLE_STUDENT',
      departmentId: user.departmentId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.username || !form.email) {
      showToast('Name, username and email are required', 'warning');
      return;
    }
    if (!editUser && !form.password) {
      showToast('Password is required for new users', 'warning');
      return;
    }
    try {
      setSaving(true);
      let res;
      if (editUser) {
        const payload = { fullName: form.fullName, email: form.email, phone: form.phone, role: form.role, departmentId: form.departmentId || null };
        res = await api.put(`/users/${editUser.id}`, payload);
      } else {
        res = await api.post('/users', form);
      }
      if (res.success) {
        showToast(editUser ? 'User updated!' : 'User created!', 'success');
        setShowModal(false);
        fetchAll();
      } else {
        showToast(res.message || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) return;
    try {
      setDeactivating(true);
      const res = await api.patch(`/users/${confirmDeactivate.id}/toggle-status`);
      if (res.success) {
        showToast(`User ${confirmDeactivate.active ? 'deactivated' : 'activated'} successfully`, 'success');
        fetchAll();
      }
    } catch {
      showToast('Operation failed', 'error');
    } finally {
      setDeactivating(false);
      setConfirmDeactivate(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-1 fw-bold">User Management</h4>
          <p className="text-muted mb-0">{users.length} registered users</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-person-plus me-2"></i>Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control" placeholder="Search by name, username, email..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setRoleFilter(''); }}>
                <i className="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, fontSize: '0.8rem', flexShrink: 0 }}>
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold small">{u.fullName}</div>
                            {u.phone && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{u.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="font-monospace small">{u.username}</td>
                      <td className="small">{u.email}</td>
                      <td>
                        <span className={`badge ${
                          u.role === 'ROLE_ADMIN' ? 'bg-danger' :
                          u.role === 'ROLE_OFFICER' ? 'bg-info text-dark' :
                          u.role === 'ROLE_MANAGEMENT' ? 'bg-purple text-white' :
                          'bg-secondary'
                        }`} style={u.role === 'ROLE_MANAGEMENT' ? { backgroundColor: '#6f42c1' } : {}}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="small">{u.departmentName || '—'}</td>
                      <td>
                        {u.active !== false ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </td>
                      <td className="small text-muted">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(u)}
                          title="Edit user">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className={`btn btn-sm ${u.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => setConfirmDeactivate(u)}
                          title={u.active !== false ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`bi ${u.active !== false ? 'bi-person-x' : 'bi-person-check'}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">
                  {editUser ? `Edit User: ${editUser.username}` : 'Create New User'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={form.fullName}
                      onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Username <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={form.username}
                      disabled={!!editUser}
                      onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
                    {editUser && <div className="form-text">Username cannot be changed</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone</label>
                    <input type="tel" className="form-control" value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  {!editUser && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Password <span className="text-danger">*</span></label>
                      <input type="password" className="form-control" value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Role <span className="text-danger">*</span></label>
                    <select className="form-select" value={form.role}
                      onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </div>
                  {(form.role === 'ROLE_OFFICER') && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Department</label>
                      <select className="form-select" value={form.departmentId}
                        onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  {editUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={!!confirmDeactivate}
        title={confirmDeactivate?.active !== false ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${confirmDeactivate?.active !== false ? 'deactivate' : 'activate'} user "${confirmDeactivate?.fullName}"?`}
        confirmLabel={confirmDeactivate?.active !== false ? 'Deactivate' : 'Activate'}
        confirmVariant={confirmDeactivate?.active !== false ? 'danger' : 'success'}
        loading={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmDeactivate(null)}
      />
    </div>
  );
}
