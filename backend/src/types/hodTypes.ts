export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface AttendanceHistoryDay {
  date: string;
  present: number;
  total: number;
  percentage: number;
}

export interface StaffLogDay {
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  status: "Present" | "Absent";
}

export interface StaffMemberDetail {
  erpid: string;
  name: string;
  email: string | null;
  loginTime: string | null;
  logoutTime: string | null;
  status: "Present" | "Absent";
  pastLogs: StaffLogDay[];
}

export interface StudentLogDay {
  date: string;
  status: "Present" | "Absent" | "No Session";
}

export interface DivisionItem {
  id: number;
  div_name: string;
  year: number;
}

export interface StudentMemberDetail {
  erpid: string;
  name: string;
  rollNo: string | null;
  division: string | null;
  divisionId: number | null;
  year: number | null;
  todayStatus: "Present" | "Absent" | "N/A";
  overallPercentage: number;
  pastLogs: StudentLogDay[];
}

export interface HodDashboardResponse {
  departmentId: number;
  departmentName: string;
  loginTime: string | null;
  logoutTime: string | null;
  students: AttendanceSummary;
  staff: AttendanceSummary;
  studentHistory: AttendanceHistoryDay[];
  staffHistory: AttendanceHistoryDay[];
}

export interface HodStaffAttendanceResponse {
  today: AttendanceSummary;
  history: AttendanceHistoryDay[];
  staffMembers: StaffMemberDetail[];
}

export interface HodStudentAttendanceResponse {
  today: AttendanceSummary;
  history: AttendanceHistoryDay[];
  divisions: DivisionItem[];
  studentsList: StudentMemberDetail[];
}

export type HodAttendanceResponse = HodStaffAttendanceResponse | HodStudentAttendanceResponse;