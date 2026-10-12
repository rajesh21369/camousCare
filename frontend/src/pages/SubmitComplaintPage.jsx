import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';

export default function SubmitComplaintPage() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    departmentId: '',
    campusLocation: '',
    priority: 'MEDIUM',
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [catRes, deptRes] = await Promise.all([
        api.get('/categories'),
        api.get('/departments'),
      ]);
      if (catRes.success) setCategories(catRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      showError('Failed to load complaint categories');
    }
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = categories.find((c) => c.id === catId);
    setSelectedCategory(cat);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      priority: cat?.defaultPriority || 'MEDIUM',
      departmentId: cat?.defaultDepartmentId || prev.departmentId,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showError('File size exceeds the 15MB limit');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.success && res.data) {
        setAttachments((prev) => [...prev, res.data]);
        showSuccess(`Attached '${file.name}'`);
      }
    } catch (err) {
      showError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleRemoveAttachment = (fileId) => {
    setAttachments((prev) => prev.filter((a) => a.fileId !== fileId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      showError('Please choose a complaint category');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        departmentId: formData.departmentId || null,
        campusLocation: formData.campusLocation.trim(),
        priority: formData.priority,
        attachments: attachments,
      };

      const res = await api.post('/complaints', payload);
      if (res.success && res.data) {
        showSuccess(`Complaint registered! Tracking Number: ${res.data.trackingNumber}`);
        navigate(`/complaints/${res.data.id}`);
      }
    } catch (err) {
      showError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Submit New Complaint</h3>
          <p className="text-muted small mb-0">
            Provide detailed information so the assigned department can resolve your issue quickly.
          </p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card-custom p-4 bg-white">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold text-dark small">Complaint Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Broken water tap in C-Block washroom, Wi-Fi connectivity in Lab 4"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  minLength={5}
                  maxLength={150}
                  required
                />
                <div className="form-text small">Brief summary of the issue (5–150 characters).</div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark small">Complaint Category *</label>
                  <select
                    className="form-select"
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.slaDays} Days SLA)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark small">Priority</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="LOW">Low (Minor inconvenience)</option>
                    <option value="MEDIUM">Medium (Normal daily disruption)</option>
                    <option value="HIGH">High (Substantial hindrance to classes/amenities)</option>
                    <option value="CRITICAL">Critical (Immediate safety or health risk)</option>
                  </select>
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-bold text-dark small">Campus Location / Room *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Academic Block 2, Floor 3, Room 304 or Girls Hostel Block A"
                    value={formData.campusLocation}
                    onChange={(e) => setFormData({ ...formData, campusLocation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-dark small">Detailed Description *</label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Describe when the issue began, exact symptoms, and any other helpful details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  minLength={10}
                  maxLength={2000}
                  required
                ></textarea>
                <div className="form-text small">Minimum 10 characters.</div>
              </div>

              {/* Attachments Section */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark small">Supporting Photos or Documents (Optional)</label>
                <div className="input-group">
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  {uploading && (
                    <span className="input-group-text bg-light">
                      <span className="spinner-border spinner-border-sm me-1 text-primary"></span>
                      Uploading...
                    </span>
                  )}
                </div>
                <div className="form-text small">Accepted: JPG, PNG, PDF, DOCX (Max 15MB).</div>

                {attachments.length > 0 && (
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    {attachments.map((att) => (
                      <div
                        key={att.fileId}
                        className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <i className="bi bi-paperclip text-primary"></i>
                        <span className="text-truncate" style={{ maxWidth: '200px' }}>{att.fileName}</span>
                        <button
                          type="button"
                          className="btn-close btn-close-sm"
                          style={{ fontSize: '0.65rem' }}
                          onClick={() => handleRemoveAttachment(att.fileId)}
                        ></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light px-4"
                  onClick={() => navigate('/student/dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-navy px-4 fw-semibold d-flex align-items-center gap-2"
                  disabled={submitting || uploading}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill"></i>
                      <span>Lodge Complaint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info & Guidelines */}
        <div className="col-lg-4">
          {selectedCategory && (
            <div className="card-custom p-4 bg-primary bg-opacity-10 border-primary border-opacity-25 mb-4">
              <h6 className="fw-bold text-primary mb-2">
                <i className="bi bi-clock-history me-1"></i> Category SLA Notice
              </h6>
              <p className="small text-dark mb-2">
                Complaints submitted under <strong>{selectedCategory.name}</strong> have an official target turnaround of{' '}
                <span className="badge bg-primary">{selectedCategory.slaDays} Days</span>.
              </p>
              <div className="small text-muted">
                {selectedCategory.description}
              </div>
            </div>
          )}

          <div className="card-custom p-4 bg-white">
            <h6 className="fw-bold text-dark mb-3">
              <i className="bi bi-info-circle-fill text-info me-1"></i> Submission Guidelines
            </h6>
            <ul className="small text-muted ps-3 mb-0" style={{ lineHeight: '1.7' }}>
              <li>Provide exact location details (floor, room number, block).</li>
              <li>Attach a clear photograph if physical damage or leakage is present.</li>
              <li>You will receive a unique tracking ID (e.g. <code>CMP-2026-0001</code>) instantly.</li>
              <li>You can view status updates and chat comments in real-time.</li>
              <li>Once resolved, you will be prompted to give feedback and rate the service.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
