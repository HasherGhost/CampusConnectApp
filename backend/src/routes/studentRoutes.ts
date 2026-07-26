import { Router } from "express";
import {
  authenticateRequest,
  authorizeRoles,
} from "../middleware/authMiddleware";
import {
  getStudentAttendance,
  getSubjectAttendanceHistory,
} from "../controllers/studentController";

const router = Router();

router.get(
  "/attendance",
  authenticateRequest,
  authorizeRoles("student"),
  getStudentAttendance,
);

router.get(
  "/attendance/history/:subjectId",
  authenticateRequest,
  authorizeRoles("student"),
  getSubjectAttendanceHistory,
);

export default router;