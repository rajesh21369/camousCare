import React from 'react';
import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div className="card shadow-sm border-0 text-center p-5" style={{ maxWidth: '450px' }}>
        <div className="mb-3">
          <i className="bi bi-shield-lock-fill text-danger" style={{ fontSize: '4rem' }}></i>
        </div>
        <h3 className="fw-bold text-dark">Access Denied (403)</h3>
        <p className="text-muted mt-2">
          You do not have the required permissions or role to access this resource.
        </p>
        <div className="mt-4">
          <Link to="/" className="btn btn-primary px-4">
            <i className="bi bi-house me-2"></i>Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
