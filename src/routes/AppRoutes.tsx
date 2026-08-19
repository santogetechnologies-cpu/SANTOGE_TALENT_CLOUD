import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleDashboardPath } from '../permissions/guards';
import { AppShell } from '../components/shared/AppShell';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { AccessDenied } from '../components/guards/AccessDenied';

// Auth
import { Login } from '../features/auth/Login';

// Platform Admin
import { SuperAdminDashboard } from '../features/admin/SuperAdminDashboard';
import { StudentsList } from '../features/admin/StudentsList';
import { BulkStudentImport } from '../features/admin/BulkStudentImport';
import { CollegesList } from '../features/admin/CollegesList';
import { CollegeCreationWizard } from '../features/admin/CollegeCreationWizard';
import { BatchesList } from '../features/admin/BatchesList';
import { PlatformAnalytics } from '../features/admin/PlatformAnalytics';
import { SystemSettings } from '../features/admin/SystemSettings';
import { UserManagement } from '../features/admin/UserManagement';

// Operations
import { OperationsDashboard } from '../features/operations/OperationsDashboard';
import { AtRiskCenter } from '../features/operations/AtRiskCenter';

// Finance
import { PaymentsQueue } from '../features/finance/PaymentsQueue';

// Content
import { ContentWorkflowHub } from '../features/content/ContentWorkflowHub';

// College CPOS
import { CollegeDashboard } from '../features/college/CollegeDashboard';
import { StudentDirectory } from '../features/college/StudentDirectory';
import { CollegeStudentImport } from '../features/college/CollegeStudentImport';
import { DepartmentView } from '../features/college/DepartmentView';
import { PlacementReports } from '../features/college/PlacementReports';
import { CampusDrivesHub } from '../features/placement/CampusDrivesHub';
import { CompanyCRM } from '../features/placement/CompanyCRM';
import { JobMarketIntel } from '../features/placement/JobMarketIntel';

// Mentorship & Batch
import { MentorDashboard } from '../features/mentor/MentorDashboard';
import { BatchCoordinatorDashboard } from '../features/batch/BatchCoordinatorDashboard';

// Student Portal
import { StudentDashboard } from '../features/student/dashboard/StudentDashboard';
import { LearningTracks } from '../features/student/learning/LearningTracks';
import { LabsHub } from '../features/student/labs/LabsHub';
import { CodingArena } from '../features/student/coding/CodingArena';
import { ProjectStudio } from '../features/student/projects/ProjectStudio';
import { PlacementAccelerator } from '../features/student/placement/PlacementAccelerator';
import { PerformanceAnalytics } from '../features/student/performance/PerformanceAnalytics';
import { CareerHub } from '../features/student/career/CareerHub';

// Recruiter
import { RecruiterDashboard } from '../features/recruiter/RecruiterDashboard';
import { TalentDiscovery } from '../features/recruiter/TalentDiscovery';
import { JobPostings } from '../features/recruiter/JobPostings';
import { KanbanPipeline } from '../features/recruiter/KanbanPipeline';

export const AppRoutes: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  const defaultDashboard = getRoleDashboardPath(role);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to={defaultDashboard} replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Authenticated Layout Shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Super Admin Routes */}
        <Route path="/admin" element={<SuperAdminDashboard />} />
        <Route path="/admin/students" element={<StudentsList />} />
        <Route path="/admin/bulk-import" element={<BulkStudentImport />} />
        <Route path="/admin/colleges" element={<CollegesList />} />
        <Route path="/admin/create-college" element={<CollegeCreationWizard />} />
        <Route path="/admin/batches" element={<BatchesList />} />
        <Route path="/admin/analytics" element={<PlatformAnalytics />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/settings" element={<SystemSettings />} />

        {/* Operations Manager */}
        <Route path="/operations" element={<OperationsDashboard />} />
        <Route path="/operations/batches" element={<BatchesList />} />
        <Route path="/operations/mentors" element={<MentorDashboard />} />
        <Route path="/operations/at-risk" element={<AtRiskCenter />} />
        <Route path="/operations/attendance" element={<BatchCoordinatorDashboard />} />

        {/* Finance Admin */}
        <Route path="/finance" element={<PaymentsQueue />} />
        <Route path="/finance/payments" element={<PaymentsQueue />} />
        <Route path="/finance/invoices" element={<PaymentsQueue />} />
        <Route path="/finance/subscriptions" element={<PaymentsQueue />} />

        {/* Content Manager */}
        <Route path="/content" element={<ContentWorkflowHub />} />
        <Route path="/content/manage" element={<ContentWorkflowHub />} />
        <Route path="/content/labs" element={<LabsHub />} />
        <Route path="/content/challenges" element={<CodingArena />} />
        <Route path="/content/placement" element={<PlacementAccelerator />} />

        {/* College CPOS & Placement Officer */}
        <Route path="/college/dashboard" element={<CollegeDashboard />} />
        <Route path="/college/students" element={<StudentDirectory />} />
        <Route path="/college/import" element={<CollegeStudentImport />} />
        <Route path="/college/departments" element={<DepartmentView />} />
        <Route path="/college/department" element={<DepartmentView />} />
        <Route path="/college/eligibility" element={<DepartmentView />} />
        <Route path="/college/reports" element={<PlacementReports />} />
        <Route path="/placement/drives" element={<CampusDrivesHub />} />
        <Route path="/placement/companies" element={<CompanyCRM />} />
        <Route path="/placement/outreach" element={<CompanyCRM />} />
        <Route path="/placement/market-intel" element={<JobMarketIntel />} />

        {/* Learning Operations (Mentor & Batch Coord) */}
        <Route path="/mentor/dashboard" element={<MentorDashboard />} />
        <Route path="/mentor/batches" element={<BatchesList />} />
        <Route path="/mentor/interventions" element={<MentorDashboard />} />
        <Route path="/mentor/mock-interviews" element={<MentorDashboard />} />

        <Route path="/batch/dashboard" element={<BatchCoordinatorDashboard />} />
        <Route path="/batch/completion" element={<BatchCoordinatorDashboard />} />
        <Route path="/batch/announcements" element={<BatchCoordinatorDashboard />} />

        {/* Student Portal */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/learning" element={<LearningTracks />} />
        <Route path="/student/labs" element={<LabsHub />} />
        <Route path="/student/coding" element={<CodingArena />} />
        <Route path="/student/projects" element={<ProjectStudio />} />
        <Route path="/student/placement" element={<PlacementAccelerator />} />
        <Route path="/student/performance" element={<PerformanceAnalytics />} />
        <Route path="/student/career" element={<CareerHub />} />

        {/* Recruiter Portal */}
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/talent" element={<TalentDiscovery />} />
        <Route path="/recruiter/jobs" element={<JobPostings />} />
        <Route path="/recruiter/pipeline" element={<KanbanPipeline />} />
        <Route path="/recruiter/interviews" element={<KanbanPipeline />} />

        {/* Unauthorized / 404 Access Denied */}
        <Route path="/unauthorized" element={<AccessDenied />} />
        <Route path="*" element={<AccessDenied />} />
      </Route>
    </Routes>
  );
};
