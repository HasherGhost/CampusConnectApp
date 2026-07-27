import { supabase } from "../config/supabase";
import { sendNotification } from "../config/firebaseAdmin";
import {SessionCreateRequest} from "../types/facultyTypes";
import ExcelJS from "exceljs";

class FacultyService {
  static async saveToken(erpid: string, token: string): Promise<void> {
    const { error } = await supabase
      .from("fcm_tokens")
      .upsert({ erpid, token }, { onConflict: "erpid" });

    if (error) {
      throw new Error(error.message);
    }
  }

  static async triggerNotification(erpid: string, type?: string): Promise<void> {
    await sendNotification(erpid, type);
  }

  static async sessionStart(payload: SessionCreateRequest, facultyErpId: string) {
    // console.log("this is payload",payload);
    console.log("this is insertion rotue");
    console.log("this is facultyErpId",facultyErpId);

     // Fetch department short code
  const { data: department, error: deptError } = await supabase
    .from("departments")
    .select("short_code")
    .eq("id", payload.department_id)
    .single();

  if (deptError) {
    throw new Error(deptError.message);
  }

  // Fetch division
  const { data: division, error: divError } = await supabase
    .from("divisions")
    .select("div_name")
    .eq("id", payload.division_id)
    .single();

  if (divError) {
    throw new Error(divError.message);
  }

  // Convert year number to code
  const yearMap: Record<number, string> = {
    1: "FE",
    2: "SE",
    3: "TE",
    4: "BE",
  };

  const yearCode = yearMap[payload.year];

  // Generate embedding path
  const embeddingPath =
    `${department.short_code}_${yearCode}_DIV-${division.div_name}`;


    const { data, error } = await supabase
      .from("sessions")
      .insert({
        ...payload,
        faculty_erpid: facultyErpId,
         embedding_path: embeddingPath,
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      throw new Error(error.message);
    }

    return data.id;
  }

  static async completeSession(sessionID: number) {
    const { data, error } = await supabase
      .from("sessions")
      .update({
        status: "pending",
      })
      .eq("id", sessionID)
      .select();

      console.log("data:", data);
      console.log("error:", error);

      if (error) {
        console.log("got the error");
        throw new Error(error.message);
      }

    console.log("changed to pending");
    return data;
  }

  static async initializeAttendance(
    sessionID: number,
    payload: any
  ) {
    const {
      department_id,
      division_id,
      year,
      subject_id,
      session_date,
    } = payload;

    // Fetch all students of the class
    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("erpid")
      .eq("department_id", department_id)
      .eq("division_id", division_id)
      .eq("year", year);

    if (studentError) {
      throw new Error(studentError.message);
    }

    if (!students || students.length === 0) {
      return;
    }

    // Create attendance rows with default status = Absent
    const attendanceRows = students.map((student) => ({
      student_erpid: student.erpid,
      session_id: sessionID,
      subject_id,
      division_id,
      department_id,
      session_date,
      status: "Absent",
      source: "auto",
      confidence: null,
      marked_by: null,
      detected_at: null,
    }));

    const { error: insertError } = await supabase
      .from("attendance_details")
      .insert(attendanceRows);

    if (insertError) {
      throw new Error(insertError.message);
    }

    return attendanceRows.length;
  }

  static async getDropdownData() {
    // =======================
    // Fetch Subjects
    // =======================
    const { data: subjects, error: subjectError } = await supabase
      .from("subjects")
      .select("*")
      .order("name");

    console.log("Subjects Error:", subjectError);
    console.log("Raw Subjects:", subjects);

    if (subjectError) {
      throw new Error(subjectError.message);
    }

    // =======================
    // Fetch Divisions
    // =======================
    const { data: divisions, error: divisionError } = await supabase
      .from("divisions")
      .select("*")
      .order("div_name");

    console.log("Divisions Error:", divisionError);
    console.log("Raw Divisions:", divisions);

    if (divisionError) {
      throw new Error(divisionError.message);
    }

    // =======================
    // Format Subjects
    // =======================
    const formattedSubjects = (subjects ?? []).map((subject) => ({
      label: subject.name,
      value: subject.id,
    }));

    // =======================
    // Format Sections
    // =======================
    const formattedSections = (divisions ?? []).map((division) => ({
      label: `Section ${division.div_name}`,
      division: division.div_name,
      divisionId: division.id,
    }));

    console.log("Formatted Subjects:", formattedSubjects);
    console.log("Formatted Sections:", formattedSections);

    const response = {
      subjects: formattedSubjects,
      sections: formattedSections,
    };

    console.log("Final Response:", JSON.stringify(response, null, 2));

    return response;
  }



  static async getExportDropdownData(facultyErpid: string) {
  // Subjects assigned to the teacher
  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select(`
      subject_id,
      subjects (
        id,
        name
      )
    `)
    .eq("faculty_erpid", facultyErpid);

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  // All divisions
  const { data: divisionData, error: divisionError } = await supabase
    .from("divisions")
    .select("id, div_name");

  if (divisionError) {
    throw new Error(divisionError.message);
  }

  // Remove duplicate subjects
  const subjects = Array.from(
    new Map(
      (sessionData ?? []).map((item: any) => [
        item.subjects.id,
        {
          label: item.subjects.name,
          value: item.subjects.id,
        },
      ])
    ).values()
  );

  const divisions = (divisionData ?? []).map((item: any) => ({
    label: item.div_name,
    value: item.id,
  }));

  return {
    subjects,
    divisions,
  };
}


// static async exportAttendance(
//   subjectId: number,
//   divisionId: number,
//   fromDate: string,
//   toDate: string
// ) {
//   // Get attendance records
//   const { data: attendanceDetails, error } = await supabase
//     .from("attendance_details")
//     .select(`
//       student_erpid,
//       session_date,
//       status
//     `)
//     .eq("subject_id", subjectId)
//     .eq("division_id", divisionId)
//     .gte("session_date", fromDate)
//     .lte("session_date", toDate)
//     .order("session_date");


//   if (error) {
//     throw new Error(error.message);
//   }

//   // Get unique ERPIDs
//   const erpids = [...new Set(attendanceDetails.map(a => a.student_erpid))];

//   console.log("attendanceDetails", attendanceDetails);

//   // Fetch students
//   const { data: students } = await supabase
//     .from("students")
//     .select("erpid, roll_no, name")
//     .in("erpid", erpids);

//   const studentMap = new Map(
//     (students ?? []).map(student => [student.erpid, student])
//   );

//   console.log("student " , studentMap);

//   // Create Excel
//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet("Attendance");

//   sheet.columns = [
//     { header: "Date", key: "date", width: 15 },
//     { header: "Roll No", key: "roll", width: 15 },
//     { header: "ERPID", key: "erpid", width: 15 },
//     { header: "Student Name", key: "name", width: 30 },
//     { header: "Status", key: "status", width: 15 },
//   ];

//   attendanceDetails.forEach(record => {
//     const student = studentMap.get(record.student_erpid);

//     sheet.addRow({
//       date: record.session_date,
//       roll: student?.roll_no ?? "",
//       erpid: record.student_erpid,
//       name: student?.name ?? "",
//       status: record.status,
//     });
//   });

//   return workbook.xlsx.writeBuffer();
// }


static async exportAttendance(
  subjectId: number,
  divisionId: number,
  fromDate: string,
  toDate: string
) {
  // Get attendance records
  const { data: attendanceDetails, error } = await supabase
    .from("attendance_details")
    .select(`
      student_erpid,
      session_date,
      status
    `)
    .eq("subject_id", subjectId)
    .eq("division_id", divisionId)
    .gte("session_date", fromDate)
    .lte("session_date", toDate)
    .order("session_date");

  if (error) {
    throw new Error(error.message);
  }

  if (!attendanceDetails || attendanceDetails.length === 0) {
  throw new Error("No attendance records found for the selected filters.");
}

  // Get unique ERPIDs
  const erpids = [...new Set(attendanceDetails.map((a) => a.student_erpid))];

  // Fetch students
  const { data: students } = await supabase
    .from("students")
    .select("erpid, roll_no, name")
    .in("erpid", erpids);

  const studentMap = new Map(
    (students ?? []).map((student) => [student.erpid, student])
  );

  // Unique sorted dates (these become columns)
  const dates = [...new Set(attendanceDetails.map((a) => a.session_date))].sort();

  // Build lookup: erpid -> { date: status }
  const statusLookup = new Map<string, Map<string, string>>();
  attendanceDetails.forEach((record) => {
    if (!statusLookup.has(record.student_erpid)) {
      statusLookup.set(record.student_erpid, new Map());
    }
    statusLookup.get(record.student_erpid)!.set(record.session_date, record.status);
  });

  // Build student rows, sorted by roll no
  const studentRows = erpids
    .map((erpid) => {
      const student = studentMap.get(erpid);
      return {
        erpid,
        rollNo: student?.roll_no ?? "",
        name: student?.name ?? "",
      };
    })
    .sort((a, b) => String(a.rollNo).localeCompare(String(b.rollNo), undefined, { numeric: true }));

  // Build Excel
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");

  // Fixed columns + one column per date
  sheet.columns = [
    { header: "Roll No", key: "rollNo", width: 12 },
    { header: "ERP ID", key: "erpid", width: 15 },
    { header: "Student Name", key: "name", width: 28 },
    ...dates.map((date) => ({ header: date, key: date, width: 14 })),
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  // Add one row per student
  studentRows.forEach((student) => {
    const rowData: Record<string, string> = {
      rollNo: student.rollNo,
      erpid: student.erpid,
      name: student.name,
    };

    dates.forEach((date) => {
      rowData[date] = statusLookup.get(student.erpid)?.get(date) ?? "-";
    });

    const row = sheet.addRow(rowData);

    // Color-code Present/Absent cells
    dates.forEach((date) => {
      const cell = row.getCell(date);
      if (cell.value === "Present") {
        cell.font = { color: { argb: "FF15803D" } }; // green
      } else if (cell.value === "Absent") {
        cell.font = { color: { argb: "FFDC2626" } }; // red
      }
      cell.alignment = { horizontal: "center" };
    });
  });

  return workbook.xlsx.writeBuffer();
}
 


  
 }







export default FacultyService;
