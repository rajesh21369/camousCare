import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AdminAssignComplaintPage() {
  const [searchParams] = useSearchParams();
  const [unassigned, setUnassigned] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignForm, setAssignForm] = useState({ departmentId: '', officerId: '', priority: '', dueDate: '', adminNote: '' });
  const [assigning, setAssigning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [unassignedRes, officersRes, deptsRes] = await Promise.all([
        api.get('/complaints/unassigned'),
        api.get('/users?role=ROLE_OFFICER'),
        api.get('/departments'),
      ]);
      if (unassignedRes.success) setUnassigned(unassignedRes.data?.content || unassignedRes.data || []);
      if (officersRes.success) setOfficers(officersRes.data?.content || officersRes.data || []);
      if (deptsRes.success) setDepartments(deptsRes.data || []);

      // Pre-select complaint from query param
      const cid = searchParams.get('complaintId');
      if (cid) {
        const res = await api.get(`/complaints/${cid}`);
        if (res.success) {
          setSelectedComplaint(res.data);
          setAssignForm(prev => ({
            ...prev,
            departmentId: res.data.departmentId || '',
            priority: res.data.priority || '',
          }));
        }
      }
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignForm({
      departmentId: complaint.departmentId || '',
      officerId: complaint.assignedOfficerId || '',
      priority: complaint.priority || 'MEDIUM',
      dueDate: complaint.dueDate ? complaint.dueDate.split('T')[0] : '',
      adminNote: '',
    });
  };

  const filteredOfficers = officers.filter(o =>
    !assignForm.departmentId || o.departmentId === assignForm.departmentId
  );

  const handleAssign = async () => {
    if (!selectedComplaint) return;
    if (!assignForm.departmentId) { showToast('Please select a department', 'warning'); return; }
    try {
      setAssigning(true);
      const payload = {
        departmentId: assignForm.departmentId,
        officerId: assignForm.officerId || null,
        priority: assignForm.priority || null,
        dueDate: assignForm.dueDate || null,
        adminNote: assignForm.adminNote || null,
      };
      const res = await api.post(`/complaints/${selectedComplaint.id}/assign`, payload);
      if (res.success) {
        showToast('Complaint assigned successfully!', 'success');
        setSelectedComplaint(null);
        setAssignForm({ departmentId: '', officerId: '', priority: '', dueDate: '', adminNote: '' });
        fetchAll();
      } else {
        showToast(res.message || 'Assignment failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Assignment failed', 'error');
    } finally {
      setAssigning(false);
      setConfirmOpen(false);
    }
  };

  const displayList = filterDept
    ? unassigned.filter(c => c.departmentId === filterDept)
    : unassigned;

  return (
    <div className="page-container fade-in">
      <div className="mb-4">
        <h4 className="mb-1 fw-bold">Assign Complaints</h4>
        <p className="text-muted mb-0">
          Assign unassigned complaints to departments and officers
          {unassigned.length > 0 && <span className="ms-2 badge bg-warning text-dark">{unassigned.length} pending</span>}
        </p>
      </div>

      <div className="row g-4">
        {/* Left: Unassigned list */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">Unassigned Complaints</h6>
              <select className="form-select form-select-sm w-auto" value={filterDept}
                onChange={e => setFilterDept(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary"></div>
                </div>
              ) : displayList.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle fs-1 text-success"></i>
                  <p className="text-muted mt-2">All complaints are assigned!</p>
                </div>
              ) : (
                displayList.map(c => (
                  <div
                    key={c.id}
                    className={`p-3 border-bottom cursor-pointer ${selectedComplaint?.id === c.id ? 'bg-primary bg-opacity-10 border-start border-primary border-3' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSelect(c)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="badge bg-light text-dark border font-monospace small">{c.trackingNumber}</span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <div className="fw-semibold small">{c.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-person me-1"></i>{c.studentName}
                      {c.departmentName && <span className="ms-2"><i className="bi bi-building me-1"></i>{c.departmentName}</span>}
                    </div>
                    <div className="d-flex gap-2 mt-1">
                      <StatusBadge status={c.status} />
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Assignment form */}
        <div className="col-lg-6">
          {selectedComplaint ? (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0 fw-semibold">
                  <i className="bi bi-person-check me-2"></i>
                  Assign: {selectedComplaint.trackingNumber}
                </h6>
              </div>
              <div className="card-body">
                {/* Complaint Summary */}
                <div className="bg-light rounded p-3 mb-4">
                  <div className="fw-semibold mb-1">{selectedComplaint.title}</div>
                  <div className="text-muted small mb-2">{selectedComplaint.description?.substring(0, 120)}...</div>
                  <div className="d-flex gap-2 flex-wrap">
                    <StatusBadge status={selectedComplaint.status} />
                    <PriorityBadge priority={selectedComplaint.priority} />
                    {selectedComplaint.categoryName && (
                      <span className="badge bg-secondary">{selectedComplaint.categoryName}</span>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Department <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={assignForm.departmentId}
                    onChange={e => setAssignForm(prev => ({ ...prev, departmentId: e.target.value, officerId: '' }))}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Assign Officer</label>
                  <select
                    className="form-select"
                    value={assignForm.officerId}
                    onChange={e => setAssignForm(prev => ({ ...prev, officerId: e.target.value }))}
                    disabled={!assignForm.departmentId}
                  >
                    <option value="">Department (unassigned to specific officer)</option>
                    {filteredOfficers.map(o => (
                      <option key={o.id} value={o.id}>{o.fullName} ({o.username})</option>
                    ))}
                  </select>
                  {!assignForm.departmentId && (
                    <div className="form-text">Select a department first to filter officers</div>
                  )}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold">Priority Override</label>
                    <select
                      className="form-select"
                      value={assignForm.priority}
                      onChange={e => setAssignForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="">Keep current</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={assignForm.dueDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setAssignForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Admin Note (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Internal note for the assigned officer..."
                    value={assignForm.adminNote}
                    onChange={e => setAssignForm(prev => ({ ...prev, adminNote: e.target.value }))}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary flex-grow-1"
                    onClick={() => setConfirmOpen(true)}
                    disabled={!assignForm.departmentId || assigning}
                  >
                    <i className="bi bi-person-check me-2"></i>Confirm Assignment
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => setSelectedComplaint(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <i className="bi bi-arrow-left-circle fs-1 text-muted mb-3 d-block"></i>
                <h6 className="text-muted">Select a complaint from the left panel to assign it</h6>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        show={confirmOpen}
        title="Confirm Assignment"
        message={`Are you sure you want to assign complaint ${selectedComplaint?.trackingNumber} to ${
          assignForm.officerId
            ? officers.find(o => o.id === assignForm.officerId)?.fullName || 'selected officer'
            : departments.find(d => d.id === assignForm.departmentId)?.name + ' department'
        }?`}
        confirmText={assigning ? 'Assigning...' : 'Assign'}
        confirmVariant="primary"
        onConfirm={handleAssign}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
