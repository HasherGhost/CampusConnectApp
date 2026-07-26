export type UserRole = "faculty" | "guard" | "student" | "hod";

export type LoginRequest = {
  erpId: string;
  password: string;
  role: UserRole;
};

export type AuthUser = {
  id: string;
  erpId: string;
  name: string;
  role: UserRole;
  departmentId?: number;
  departmentName?: string;
  departmentShortCode?: string;
};

export type LoginResponse = {
  success: true;
  token: string;
  role: UserRole;
  user: AuthUser;
};

export type JwtPayload = {
  sub: string;
  erpId: string;
  name: string;
  role: UserRole;
  departmentId?: number;
  departmentName?: string;
  departmentShortCode?: string;
};