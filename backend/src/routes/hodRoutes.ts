import { Router } from "express";
import { authenticateRequest, authorizeRoles } from "../middleware/authMiddleware";
import {
  getHodDashboard,
  getHodStudentAttendance,
  getHodStaffAttendance,
} from "../controllers/hodController";

const router = Router();

console.log("hodRoutes loaded");

router.get("/dashboard", authenticateRequest, authorizeRoles("hod"), getHodDashboard);
router.get("/students", authenticateRequest, authorizeRoles("hod"), getHodStudentAttendance);
router.get("/staff", authenticateRequest, authorizeRoles("hod"), getHodStaffAttendance);

export default router;