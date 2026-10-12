import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

const emptyForm = { name: '', description: '', departmentId: '', defaultPriority: 'MEDIUM', estimatedResolutionHours: 48 };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, deptRes] = await Promise.all([
        api.get('/categories'),
        api.get('/departments')
      ]);
      if (catRes.success) setCategories(catRes.data || []);
      if (deptRes.success) setDepartments(deptRes.data || []);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditCategory(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCategory(cat);
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      departmentId: cat.departmentId || '',
      defaultPriority: cat.defaultPriority || 'MEDIUM',
      estimatedResolutionHours: cat.estimatedResolutionHours || 48,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Category name is required', 'warning');
      return;
    }
    try {
      setSaving(true);
      const res = editCategory
        ? await api.put(`/categories/${editCategory.id}`, form)
        : await api.post('/categories', form);
      if (res.success) {
        showToast(editCategory ? 'Category updated!' : 'Category created!', 'success');
        setShowModal(false);
        fetchData();
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
      const res = await api.delete(`/categories/${confirmDelete.id}`);
      if (res.success) {
        showToast('Category deleted', 'success');
        fetchData();
      } else {
        showToast(res.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete category in use', 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const filtered = categories.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container fade-in">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-1 fw-bold">Complaint Categories</h4>
          <p className="text-muted mb-0">{categories.length} categories configured</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-tag me-2"></i>Add Category
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-2">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Name</th>
                    <th>Description</th>
                    <th>Default Dept</th>
                    <th>Default Priority</th>
                    <th>SLA (Hours)</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(cat => (
                    <tr key={cat.id}>
                      <td className="ps-3 fw-semibold">
                        <i className="bi bi-tag-fill text-primary me-2"></i>
                        {cat.name}
                      </td>
                      <td className="small text-muted">{cat.description || '—'}</td>
                      <td className="small">
                        {departments.find(d => d.id === cat.departmentId)?.name || 'None'}
                      </td>
                      <td>
                        <span className="badge bg-secondary">{cat.defaultPriority}</span>
                      </td>
                      <td className="small">{cat.estimatedResolutionHours || 48}h</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(cat)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmDelete(cat)} title="Delete">
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">No categories found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">
                  {editCategory ? 'Edit Category' : 'Create Category'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Category Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Internet & Wi-Fi"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Brief description..."
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Default Department</label>
                  <select
                    className="form-select"
                    value={form.departmentId}
                    onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}
                  >
                    <option value="">None / Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold">Default Priority</label>
                    <select
                      className="form-select"
                      value={form.defaultPriority}
                      onChange={e => setForm(p => ({ ...p, defaultPriority: e.target.value }))}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold">Resolution SLA (Hours)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.estimatedResolutionHours}
                      onChange={e => setForm(p => ({ ...p, estimatedResolutionHours: parseInt(e.target.value) || 24 }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  {editCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={!!confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${confirmDelete?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
