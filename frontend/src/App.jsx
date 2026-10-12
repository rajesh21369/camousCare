import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicTrackPage from './pages/PublicTrackPage';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';

// Shared User Pages
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import MyComplaintsPage from './pages/MyComplaintsPage';

// Staff / Officer Pages
import StaffDashboard from './pages/StaffDashboard';
import AssignedComplaintsPage from './pages/AssignedComplaintsPage';
import StaffDepartmentOverviewPage from './pages/StaffDepartmentOverviewPage';
import StaffComplaintUpdatePage from './pages/StaffComplaintUpdatePage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminAllComplaintsPage from './pages/AdminAllComplaintsPage';
import AdminAssignComplaintPage from './pages/AdminAssignComplaintPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';

// Management Pages
import ManagementDashboard from './pages/ManagementDashboard';
import ManagementEscalatedPage from './pages/ManagementEscalatedPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes without Layout */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/track" element={<PublicTrackPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Protected routes wrapped in Layout */}
      <Route element={<Layout />}>
        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/submit-complaint" element={<SubmitComplaintPage />} />
          <Route path="/student/complaints" element={<MyComplaintsPage />} />
        </Route>

        {/* Officer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_OFFICER']} />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/assigned" element={<AssignedComplaintsPage />} />
          <Route path="/staff/department" element={<StaffDepartmentOverviewPage />} />
          <Route path="/staff/complaint/:id" element={<StaffComplaintUpdatePage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminAllComplaintsPage />} />
          <Route path="/admin/assign" element={<AdminAssignComplaintPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        {/* Management Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_MANAGEMENT']} />}>
          <Route path="/management/dashboard" element={<ManagementDashboard />} />
          <Route path="/management/escalated" element={<ManagementEscalatedPage />} />
        </Route>

        {/* Common Authenticated Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_OFFICER', 'ROLE_ADMIN', 'ROLE_MANAGEMENT']} />}>
          <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
