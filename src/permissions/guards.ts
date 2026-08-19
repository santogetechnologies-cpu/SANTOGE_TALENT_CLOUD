import { User, Permission, DataScope, Role } from '../types/auth';

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user || !user.isActive) return false;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user || !user.isActive) return false;
  return permissions.some(p => user.permissions.includes(p));
}

export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user || !user.isActive) return false;
  return permissions.every(p => user.permissions.includes(p));
}

export interface ScopedEntity {
  collegeId?: string;
  departmentId?: string;
  batchId?: string;
  studentId?: string;
  recruiterId?: string;
}

export function isEntityInScope(user: User | null, entity: ScopedEntity): boolean {
  if (!user) return false;
  const { dataScope, role } = user;

  // Super Admin, Ops, Finance, Content have platform-wide or role-scoped access
  if (dataScope.scopeType === 'ALL' || role === 'SUPER_ADMIN') {
    return true;
  }

  // College Super Admin & Placement Officer: must match collegeId
  if (dataScope.scopeType === 'COLLEGE') {
    if (entity.collegeId && entity.collegeId !== dataScope.collegeId) {
      return false;
    }
    return true;
  }

  // Department Coordinator: must match collegeId AND departmentId
  if (dataScope.scopeType === 'COLLEGE_DEPARTMENT') {
    if (entity.collegeId && entity.collegeId !== dataScope.collegeId) {
      return false;
    }
    if (entity.departmentId && dataScope.departmentIds && !dataScope.departmentIds.includes(entity.departmentId)) {
      return false;
    }
    return true;
  }

  // Mentor & Batch Coordinator: must match batchId
  if (dataScope.scopeType === 'ASSIGNED_BATCHES') {
    if (entity.batchId && dataScope.batchIds && !dataScope.batchIds.includes(entity.batchId)) {
      return false;
    }
    return true;
  }

  // Student: must match self studentId
  if (dataScope.scopeType === 'SELF') {
    if (entity.studentId && entity.studentId !== dataScope.studentId) {
      return false;
    }
    return true;
  }

  // Recruiter: can see public/permitted candidates, own jobs
  if (dataScope.scopeType === 'RECRUITER_PERMITTED') {
    if (entity.recruiterId && entity.recruiterId !== dataScope.recruiterId) {
      return false;
    }
    return true;
  }

  return true;
}

export function getRoleDashboardPath(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'OPERATIONS_MANAGER':
      return '/operations';
    case 'FINANCE_ADMIN':
      return '/finance';
    case 'CONTENT_MANAGER':
      return '/content';
    case 'COLLEGE_SUPER_ADMIN':
      return '/college/dashboard';
    case 'COLLEGE_PLACEMENT_OFFICER':
      return '/placement/drives';
    case 'DEPARTMENT_COORDINATOR':
      return '/college/department';
    case 'MENTOR':
      return '/mentor/dashboard';
    case 'BATCH_COORDINATOR':
      return '/batch/dashboard';
    case 'STUDENT':
      return '/student/dashboard';
    case 'RECRUITER':
      return '/recruiter/dashboard';
    default:
      return '/login';
  }
}
