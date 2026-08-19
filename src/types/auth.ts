export type Role =
  // Internal SantoGe Roles
  | 'SUPER_ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'FINANCE_ADMIN'
  | 'CONTENT_MANAGER'
  // College Roles
  | 'COLLEGE_SUPER_ADMIN'
  | 'COLLEGE_PLACEMENT_OFFICER'
  | 'DEPARTMENT_COORDINATOR'
  // Learning Operations Roles
  | 'MENTOR'
  | 'BATCH_COORDINATOR'
  // Student Role
  | 'STUDENT'
  // Recruiter Role
  | 'RECRUITER';

export type ScopeType =
  | 'ALL'
  | 'COLLEGE'
  | 'COLLEGE_DEPARTMENT'
  | 'ASSIGNED_BATCHES'
  | 'SELF'
  | 'RECRUITER_PERMITTED';

export interface DataScope {
  scopeType: ScopeType;
  collegeId?: string;
  collegeName?: string;
  departmentIds?: string[];
  departmentNames?: string[];
  batchIds?: string[];
  studentId?: string;
  recruiterId?: string;
}

export type Permission =
  // Platform & Settings
  | 'MANAGE_SYSTEM_SETTINGS'
  | 'MANAGE_PERMISSIONS'
  | 'VIEW_PLATFORM_ANALYTICS'
  // Student Management
  | 'VIEW_ALL_STUDENTS'
  | 'VIEW_COLLEGE_STUDENTS'
  | 'VIEW_DEPARTMENT_STUDENTS'
  | 'VIEW_BATCH_STUDENTS'
  | 'VIEW_SELF_STUDENT'
  | 'CREATE_STUDENTS'
  | 'BULK_IMPORT_STUDENTS'
  | 'ACTIVATE_STUDENTS'
  | 'RESET_STUDENT_CREDENTIALS'
  // College Management
  | 'CREATE_COLLEGE'
  | 'MANAGE_ALL_COLLEGES'
  | 'MANAGE_OWN_COLLEGE'
  | 'MANAGE_DEPARTMENTS'
  // Placement & Drives
  | 'MANAGE_ALL_CAMPUS_DRIVES'
  | 'MANAGE_COLLEGE_CAMPUS_DRIVES'
  | 'CREATE_CAMPUS_DRIVE'
  | 'SHORTLIST_STUDENTS'
  | 'MANAGE_COMPANY_CRM'
  | 'OUTREACH_RECRUITERS'
  | 'VIEW_MARKET_INTELLIGENCE'
  // Mentorship & Operations
  | 'MANAGE_BATCHES'
  | 'MANAGE_MENTORS'
  | 'RECORD_INTERVENTIONS'
  | 'CONDUCT_MOCK_INTERVIEWS'
  | 'MANAGE_TELEGRAM_COMMUNITY'
  | 'POST_ANNOUNCEMENTS'
  | 'VIEW_AT_RISK_STUDENTS'
  // Learning & Content
  | 'MANAGE_LEARNING_CONTENT'
  | 'REVIEW_CONTENT'
  | 'PUBLISH_CONTENT'
  | 'ACCESS_LEARNING_ENGINE'
  | 'SUBMIT_ASSIGNMENTS'
  // Finance & Payments
  | 'VIEW_PAYMENTS'
  | 'VERIFY_PAYMENTS'
  | 'MANAGE_INVOICES'
  | 'MANAGE_SUBSCRIPTIONS'
  // Recruiter
  | 'SEARCH_TALENT'
  | 'POST_JOBS'
  | 'MANAGE_RECRUITER_PIPELINE'
  | 'DOWNLOAD_RESUME';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  roleTitle: string;
  dataScope: DataScope;
  permissions: Permission[];
  phoneNumber?: string;
  createdAt: string;
  isActive: boolean;
  firstLogin?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
