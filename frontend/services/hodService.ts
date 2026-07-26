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

export interface HodDashboardData {
  success: boolean;
  departmentId: number;
  departmentName: string;
  loginTime: string | null;
  logoutTime: string | null;
  students: AttendanceSummary;
  staff: AttendanceSummary;
  studentHistory?: AttendanceHistoryDay[];
  staffHistory?: AttendanceHistoryDay[];
}

export interface HodStudentAttendanceData {
  success: boolean;
  today: AttendanceSummary;
  history: AttendanceHistoryDay[];
  divisions: DivisionItem[];
  studentsList: StudentMemberDetail[];
}

export interface HodStaffAttendanceData {
  success: boolean;
  today: AttendanceSummary;
  history: AttendanceHistoryDay[];
  staffMembers: StaffMemberDetail[];
}

export async function getHodDashboard(
  apiBaseUrl: string,
  token: string
): Promise<HodDashboardData> {
  const response = await fetch(`${apiBaseUrl}/api/hod/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch HOD dashboard (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch HOD dashboard data");
  }

  return data;
}

export async function getHodStudentAttendance(
  apiBaseUrl: string,
  token: string
): Promise<HodStudentAttendanceData> {
  const response = await fetch(`${apiBaseUrl}/api/hod/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch student attendance (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch student attendance data");
  }

  return data;
}

export async function getHodStaffAttendance(
  apiBaseUrl: string,
  token: string
): Promise<HodStaffAttendanceData> {
  const response = await fetch(`${apiBaseUrl}/api/hod/staff`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch staff attendance (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch staff attendance data");
  }

  return data;
}
