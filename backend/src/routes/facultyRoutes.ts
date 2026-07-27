import { Router } from "express";
import { authenticateRequest, authorizeRoles } from "../middleware/authMiddleware";
import {
  createFacultyGatePass,
  saveFacultyToken,
  triggerFacultyNotification,
  insertSession,
  getTeacherAttendance,
  getSessionAttendance,
  getDropdownData,
  updateAttendance,
  getExportDropdownData,
  exportAttendance
} from "../controllers/facultyController";
import upload from "../config/multerConfig";



const router = Router();

console.log("facultyRoutes loaded");

router.post("/gate-pass", authenticateRequest, authorizeRoles("faculty"), createFacultyGatePass);
router.get("/dropdown-data", authenticateRequest, authorizeRoles("faculty"), getDropdownData);
router.post("/save-token", authenticateRequest, authorizeRoles("faculty"), saveFacultyToken);
router.post("/trigger-notification", authenticateRequest, authorizeRoles("faculty"), triggerFacultyNotification);
router.post("/insert-session", authenticateRequest, upload.array("images"), authorizeRoles("faculty"), insertSession);
router.get(
  "/teacher/:teacherId",
  getTeacherAttendance
);

router.get(
  "/teacher/session/:sessionId",
  getSessionAttendance
);

router.patch(
  "/attendance/:attendanceId",
  updateAttendance
);

// routes/export.ts

router.get(
  "/Export/dropdown-data",
  authenticateRequest,
  authorizeRoles("faculty"),
  getExportDropdownData
  
);

router.post(
  "/export-attendance",
  authenticateRequest,
  authorizeRoles("faculty"),
  exportAttendance
);


export default router;
