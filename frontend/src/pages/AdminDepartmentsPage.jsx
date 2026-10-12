import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

const emptyForm = { name: '', description: '', hodName: '', hodEmail: '', location: '' };

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      if (res.success) setDepartments(res.data || []);
    } catch {
      showToast('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditDept(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (dept) => {
    setEditDept(dept);
    setForm({
      name: dept.name || '',
      description: dept.description || '',
      hodName: dept.hodName || '',
      hodEmail: dept.hodEmail || '',
      location: dept.location || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Department name is required', 'warning');
      return;
    }
    try {
      setSaving(true);
      const res = editDept
        ? await api.put(`/departments/${editDept.id}`, form)
        : await api.post('/departments', form);
      if (res.success) {
        showToast(editDept ? 'Department updated!' : 'Department created!', 'success');
        setShowModal(false);
        fetchDepartments();
      } else {
        showToast(res.message || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/departments/${confirmDelete.id}`);
      if (res.success) {
        showToast('Department deleted', 'success');
        fetchDepartments();
      } else {
        showToast(res.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete department with active complaints', 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const filtered = departments.filter(d =>
    !search ||
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.hodName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-1 fw-bold">Department Management</h4>
          <p className="text-muted mb-0">{departments.length} departments configured</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-building-add me-2"></i>Add Department
        </button>
      </div>

      {/* Search */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-2">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control" placeholder="Search departments..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(dept => (
            <div key={dept.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="p-2 bg-primary bg-opacity-10 rounded">
                      <i className="bi bi-building text-primary fs-5"></i>
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(dept)} title="Edit">
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmDelete(dept)} title="Delete">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <h6 className="fw-bold mb-1">{dept.name}</h6>
                  {dept.description && (
                    <p className="text-muted small mb-2" style={{ lineHeight: 1.4 }}>
                      {dept.description}
                    </p>
                  )}
                  {dept.hodName && (
                    <div className="small text-muted mb-1">
                      <i className="bi bi-person-badge me-1"></i>
                      <strong>HOD:</strong> {dept.hodName}
                    </div>
                  )}
                  {dept.hodEmail && (
                    <div className="small text-muted mb-1">
                      <i className="bi bi-envelope me-1"></i>{dept.hodEmail}
                    </div>
                  )}
                  {dept.location && (
                    <div className="small text-muted">
                      <i className="bi bi-geo-alt me-1"></i>{dept.location}
                    </div>
                  )}
                  {dept.complaintCount !== undefined && (
                    <div className="mt-2 pt-2 border-top">
                      <span className="badge bg-primary">{dept.complaintCount} complaints</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-12 text-center py-5">
              <i className="bi bi-building fs-1 text-muted"></i>
              <p className="text-muted mt-2">No departments found</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">
                  {editDept ? 'Edit Department' : 'Create Department'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Department Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="e.g., IT Department"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea className="form-control" rows={3} placeholder="Department description..."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold">HOD Name</label>
                    <input type="text" className="form-control" placeholder="Head of Department"
                      value={form.hodName} onChange={e => setForm(p => ({ ...p, hodName: e.target.value }))} />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold">HOD Email</label>
                    <input type="email" className="form-control" placeholder="hod@college.edu"
                      value={form.hodEmail} onChange={e => setForm(p => ({ ...p, hodEmail: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="form-label fw-semibold">Location / Block</label>
                  <input type="text" className="form-control" placeholder="e.g., Block A, Room 101"
                    value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  {editDept ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={!!confirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
