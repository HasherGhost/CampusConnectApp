import { supabase } from "../config/supabase";
import {
  AttendanceHistoryDay,
  AttendanceSummary,
  DivisionItem,
  HodDashboardResponse,
  HodStaffAttendanceResponse,
  HodStudentAttendanceResponse,
  StaffLogDay,
  StaffMemberDetail,
  StudentLogDay,
  StudentMemberDetail,
} from "../types/hodTypes";

const HISTORY_DAYS = 7;

const getTodayIst = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

const getLastNDatesIst = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d));
  }
  return dates.sort(); // ascending, oldest first
};

const toPercentage = (present: number, total: number): number =>
  total > 0 ? Math.round((present / total) * 100) : 0;

const buildDeptOrFilter = (departmentName: string, departmentShortCode?: string): string => {
  const patterns = new Set<string>();

  if (departmentShortCode) {
    patterns.add(`dept.ilike.${departmentShortCode}`);
  }

  patterns.add(`dept.ilike.${departmentName}`);

  const firstWord = departmentName.split(" ")[0];
  if (firstWord && firstWord !== departmentName) {
    patterns.add(`dept.ilike.${firstWord}%`);
  }

  return Array.from(patterns).join(",");
};

class HodService {
  static async getStudentTotal(departmentId: number): Promise<number> {
    const { count, error } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("department_id", departmentId)
      .eq("is_active", true);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  static async getStudentAttendance(departmentId: number): Promise<HodStudentAttendanceResponse> {
    const dates = getLastNDatesIst(HISTORY_DAYS);
    const descDates = [...dates].reverse();
    const today = getTodayIst();

    // 1. Fetch active divisions for this department
    const { data: divData } = await supabase
      .from("divisions")
      .select("id, div_name, year")
      .eq("department_id", departmentId)
      .eq("active", true)
      .order("div_name");

    const divisions: DivisionItem[] = (divData ?? []).map((d) => ({
      id: d.id,
      div_name: d.div_name,
      year: d.year,
    }));

    // 2. Fetch active students for this department
    const { data: studentData, error: studErr } = await supabase
      .from("students")
      .select("id, erpid, name, roll_no, division, division_id, year")
      .eq("department_id", departmentId)
      .eq("is_active", true)
      .order("name");

    if (studErr) throw new Error(studErr.message);

    const students = studentData ?? [];
    const totalStudents = students.length;

    // 3. Fetch attendance details for these dates
    const { data: attendanceDetails, error: attErr } = await supabase
      .from("attendance_details")
      .select("student_erpid, status, session_date")
      .eq("department_id", departmentId)
      .gte("session_date", dates[0])
      .lte("session_date", dates[dates.length - 1]);

    if (attErr) throw new Error(attErr.message);

    // 4. Fetch attendance summary for students
    const studentErpIds = students.map((s) => s.erpid);
    const { data: summaryData } =
      studentErpIds.length > 0
        ? await supabase
            .from("attendance_summary")
            .select("student_erpid, total_sessions, attended_sessions")
            .in("student_erpid", studentErpIds)
        : { data: [] };

    const summaryMap = new Map<string, { total: number; attended: number }>();
    (summaryData ?? []).forEach((row) => {
      const prev = summaryMap.get(row.student_erpid) ?? { total: 0, attended: 0 };
      summaryMap.set(row.student_erpid, {
        total: prev.total + (row.total_sessions ?? 0),
        attended: prev.attended + (row.attended_sessions ?? 0),
      });
    });

    // 5. Build history summary per day
    const history: AttendanceHistoryDay[] = descDates.map((date) => {
      const presentSet = new Set(
        (attendanceDetails ?? [])
          .filter((row) => row.session_date === date && row.status === "Present")
          .map((row) => row.student_erpid),
      );
      const present = presentSet.size;
      return {
        date,
        present,
        total: totalStudents,
        percentage: toPercentage(present, totalStudents),
      };
    });

    const todaySummary =
      history.find((h) => h.date === today) ?? { date: today, present: 0, total: totalStudents, percentage: 0 };

    // 6. Build detailed student list
    const studentsList: StudentMemberDetail[] = students.map((st) => {
      const studentLogs = (attendanceDetails ?? []).filter((r) => r.student_erpid === st.erpid);

      const pastLogs: StudentLogDay[] = descDates.map((date) => {
        const dayRecord = studentLogs.find((r) => r.session_date === date);
        let status: "Present" | "Absent" | "No Session" = "No Session";
        if (dayRecord) {
          status = dayRecord.status === "Present" ? "Present" : "Absent";
        }
        return { date, status };
      });

      const todayRecord = studentLogs.find((r) => r.session_date === today);
      let todayStatus: "Present" | "Absent" | "N/A" = "N/A";
      if (todayRecord) {
        todayStatus = todayRecord.status === "Present" ? "Present" : "Absent";
      }

      const sum = summaryMap.get(st.erpid);
      const overallPercentage =
        sum && sum.total > 0
          ? Math.round((sum.attended / sum.total) * 100)
          : toPercentage(
              pastLogs.filter((p) => p.status === "Present").length,
              pastLogs.filter((p) => p.status !== "No Session").length,
            );

      return {
        erpid: st.erpid,
        name: st.name,
        rollNo: st.roll_no ?? null,
        division: st.division ?? null,
        divisionId: st.division_id ?? null,
        year: st.year ?? null,
        todayStatus,
        overallPercentage,
        pastLogs,
      };
    });

    return {
      today: {
        total: todaySummary.total,
        present: todaySummary.present,
        absent: Math.max(todaySummary.total - todaySummary.present, 0),
        percentage: todaySummary.percentage,
      },
      history,
      divisions,
      studentsList,
    };
  }

  static async getStaffErpIds(
    departmentId: number,
    departmentName: string,
    departmentShortCode?: string,
  ): Promise<string[]> {
    const erpSet = new Set<string>();

    // 1. Query faculty table by department_id
    const { data: facultyData } = await supabase
      .from("faculty")
      .select("erpid")
      .eq("department_id", departmentId)
      .eq("is_active", true);

    (facultyData ?? []).forEach((row) => row.erpid && erpSet.add(row.erpid));

    // 2. Query users table by department name / shortcode
    const { data: userData } = await supabase
      .from("users")
      .select("erpid")
      .ilike("role", "faculty")
      .or(buildDeptOrFilter(departmentName, departmentShortCode));

    (userData ?? []).forEach((row) => row.erpid && erpSet.add(row.erpid));

    return Array.from(erpSet);
  }

  static async getStaffAttendance(
    departmentId: number,
    departmentName: string,
    departmentShortCode?: string,
  ): Promise<HodStaffAttendanceResponse> {
    const dates = getLastNDatesIst(HISTORY_DAYS);
    const descDates = [...dates].reverse();
    const today = getTodayIst();

    // 1. Fetch staff members
    const { data: facultyData } = await supabase
      .from("faculty")
      .select("erpid, name, email")
      .eq("department_id", departmentId)
      .eq("is_active", true);

    const { data: userData } = await supabase
      .from("users")
      .select("erpid, name")
      .ilike("role", "faculty")
      .or(buildDeptOrFilter(departmentName, departmentShortCode));

    const staffMap = new Map<string, { erpid: string; name: string; email: string | null }>();
    (userData ?? []).forEach((u) => {
      if (u.erpid) staffMap.set(u.erpid, { erpid: u.erpid, name: u.name, email: null });
    });
    (facultyData ?? []).forEach((f) => {
      if (f.erpid) staffMap.set(f.erpid, { erpid: f.erpid, name: f.name, email: f.email ?? null });
    });

    const staffList = Array.from(staffMap.values());
    const totalStaff = staffList.length;
    const erpIds = staffList.map((s) => s.erpid);

    if (totalStaff === 0) {
      return {
        today: { total: 0, present: 0, absent: 0, percentage: 0 },
        history: descDates.map((date) => ({ date, present: 0, total: 0, percentage: 0 })),
        staffMembers: [],
      };
    }

    // 2. Fetch attendance logs for past 7 days
    const { data: logsData, error } = await supabase
      .from("attendance_logs")
      .select("erpid, date, login_time, logout_time, final_logout_time")
      .in("erpid", erpIds)
      .gte("date", dates[0])
      .lte("date", dates[dates.length - 1]);

    if (error) throw new Error(error.message);

    // 3. Build history summary per day
    const history: AttendanceHistoryDay[] = descDates.map((date) => {
      const presentSet = new Set(
        (logsData ?? [])
          .filter((row) => row.date === date && row.login_time !== null)
          .map((row) => row.erpid),
      );
      const present = presentSet.size;
      return {
        date,
        present,
        total: totalStaff,
        percentage: toPercentage(present, totalStaff),
      };
    });

    const todaySummary =
      history.find((h) => h.date === today) ?? { date: today, present: 0, total: totalStaff, percentage: 0 };

    // 4. Build detailed staff list
    const staffMembers: StaffMemberDetail[] = staffList.map((st) => {
      const memberLogs = (logsData ?? []).filter((r) => r.erpid === st.erpid);

      const pastLogs: StaffLogDay[] = descDates.map((date) => {
        const log = memberLogs.find((r) => r.date === date);
        const loginTime = log?.login_time ?? null;
        const logoutTime = log?.final_logout_time ?? log?.logout_time ?? null;
        const status: "Present" | "Absent" = loginTime !== null ? "Present" : "Absent";
        return { date, loginTime, logoutTime, status };
      });

      const todayLog = pastLogs.find((p) => p.date === today) ?? pastLogs[0];

      return {
        erpid: st.erpid,
        name: st.name,
        email: st.email,
        loginTime: todayLog?.loginTime ?? null,
        logoutTime: todayLog?.logoutTime ?? null,
        status: todayLog?.status ?? "Absent",
        pastLogs,
      };
    });

    // Sort staff members according to today's logs:
    // Present staff above absent staff, recent in-time above less recent.
    staffMembers.sort((a, b) => {
      if (a.status === "Present" && b.status === "Absent") return -1;
      if (a.status === "Absent" && b.status === "Present") return 1;

      if (a.status === "Present" && b.status === "Present") {
        if (!a.loginTime) return 1;
        if (!b.loginTime) return -1;
        const timeA = new Date(a.loginTime).getTime();
        const timeB = new Date(b.loginTime).getTime();
        if (!isNaN(timeA) && !isNaN(timeB)) {
          return timeB - timeA;
        }
        return b.loginTime.localeCompare(a.loginTime);
      }

      return a.name.localeCompare(b.name);
    });

    return {
      today: {
        total: todaySummary.total,
        present: todaySummary.present,
        absent: Math.max(todaySummary.total - todaySummary.present, 0),
        percentage: todaySummary.percentage,
      },
      history,
      staffMembers,
    };
  }

  static async getHodTodayLogs(
    hodErpId: string,
  ): Promise<{ loginTime: string | null; logoutTime: string | null }> {
    if (!hodErpId) return { loginTime: null, logoutTime: null };
    const today = getTodayIst();
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("login_time, logout_time, final_logout_time")
      .ilike("erpid", hodErpId)
      .eq("date", today)
      .order("login_time", { ascending: false, nullsFirst: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      const logout = row.final_logout_time ?? row.logout_time ?? null;
      return {
        loginTime: row.login_time ?? null,
        logoutTime: logout,
      };
    }

    if (error) console.error("[hod/getHodTodayLogs] today query error:", error);

    // Fallback: Fetch most recent log if no log exists for today
    const { data: latestData, error: latestError } = await supabase
      .from("attendance_logs")
      .select("login_time, logout_time, final_logout_time")
      .ilike("erpid", hodErpId)
      .order("date", { ascending: false })
      .order("login_time", { ascending: false, nullsFirst: false })
      .limit(1);

    if (latestError) console.error("[hod/getHodTodayLogs] latest query error:", latestError);

    if (latestData && latestData.length > 0) {
      const row = latestData[0];
      const logout = row.final_logout_time ?? row.logout_time ?? null;
      return {
        loginTime: row.login_time ?? null,
        logoutTime: logout,
      };
    }

    return { loginTime: null, logoutTime: null };
  }

  static async getDashboard(
    departmentId: number,
    departmentName: string,
    departmentShortCode?: string,
    hodErpId?: string,
  ): Promise<HodDashboardResponse> {
    const [studentAttendance, staffAttendance, hodLogs] = await Promise.all([
      this.getStudentAttendance(departmentId),
      this.getStaffAttendance(departmentId, departmentName, departmentShortCode),
      hodErpId ? this.getHodTodayLogs(hodErpId) : Promise.resolve({ loginTime: null, logoutTime: null }),
    ]);

    return {
      departmentId,
      departmentName,
      loginTime: hodLogs.loginTime,
      logoutTime: hodLogs.logoutTime,
      students: studentAttendance.today,
      staff: staffAttendance.today,
      studentHistory: studentAttendance.history,
      staffHistory: staffAttendance.history,
    };
  }
}

export default HodService;