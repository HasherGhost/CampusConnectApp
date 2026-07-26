export type UserRole = 'faculty' | 'guard' | 'student' | 'hod';

export type AuthUser = {
  id: string;
  erpId: string;
  name: string;
  role: UserRole;
  departmentId?: number;
  departmentName?: string;
  departmentShortCode?: string;
};

export type AuthSession = {
  token: string;
  role: UserRole;
  user: AuthUser;
};

export type LoginResponse = {
  success: true;
  token: string;
  role: UserRole;
  user: AuthUser;
};