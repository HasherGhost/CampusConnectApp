import { supabase } from "../config/supabase";
import {
  AttendanceHistoryItem,
  StudentAttendanceResponse,
  SubjectAttendance,
  SubjectAttendanceHistoryResponse,
} from "../types/attendance";

export class StudentAttendanceService {
  static async getAttendance(
  erpId: string,
): Promise<StudentAttendanceResponse> {

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(`
      department_id,
      year,
      semester,
      elective_subject_id
    `)
    .eq("erpid", erpId)
    .single();

  if (studentError || !student) {
    throw new Error("Student not found.");
  }

  const { data: subjectData, error: subjectError } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      is_elective
    `)
    .eq("department_id", student.department_id)
    .eq("year", student.year)
    .eq("semester", student.semester);

  if (subjectError) {
    throw new Error(subjectError.message);
  }

  const filteredSubjects =
    (subjectData ?? []).filter((subject: any) => {
      if (!subject.is_elective) {
        return true;
      }

      return subject.id === student.elective_subject_id;
    });

  const { data: attendanceData, error: attendanceError } = await supabase
    .from("attendance_summary")
    .select(`
      subject_id,
      total_sessions,
      attended_sessions
    `)
    .eq("student_erpid", erpId);

  if (attendanceError) {
    throw new Error(attendanceError.message);
  }

  const attendanceMap = new Map(
    (attendanceData ?? []).map((record: any) => [
      record.subject_id,
      record,
    ]),
  );

  const subjects: SubjectAttendance[] = filteredSubjects.map(
    (subject: any) => {
      const attendance = attendanceMap.get(subject.id);

      const attended = attendance?.attended_sessions ?? 0;
      const total = attendance?.total_sessions ?? 0;

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        attended,
        total,
        percentage:
          total === 0
            ? 0
            : Math.round((attended * 100) / total),
      };
    },
  );

  const totalAttended = subjects.reduce(
    (sum, subject) => sum + subject.attended,
    0,
  );

  const totalClasses = subjects.reduce(
    (sum, subject) => sum + subject.total,
    0,
  );

  return {
    overallAttendance:
      totalClasses === 0
        ? 0
        : Math.round((totalAttended * 100) / totalClasses),
    subjects,
  };
}
static async getSubjectHistory(
  erpId: string,
  subjectId: number,
): Promise<SubjectAttendanceHistoryResponse> {

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("id", subjectId)
    .single();

  if (subjectError || !subject) {
    throw new Error("Subject not found.");
  }

  const { data, error } = await supabase
    .from("attendance_details")
    .select(`
      session_id,
      session_date,
      status
    `)
    .eq("student_erpid", erpId)
    .eq("subject_id", subjectId)
    .order("session_date", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }
  console.log("Fetching subject history...");

  const history: AttendanceHistoryItem[] =
    (data ?? []).map((record: any) => ({
      sessionId: record.session_id,
      date: record.session_date,
      status: record.status,
    }));

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    history,
  };
}
}