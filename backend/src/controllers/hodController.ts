import { Request, Response } from "express";
import HodService from "../services/hodService";

type DeptContext = { departmentId: number; departmentName: string; departmentShortCode?: string };

const requireDeptContext = (req: Request, res: Response): DeptContext | null => {
  const { departmentId, departmentName, departmentShortCode } = req.authUser ?? {};

  if (!departmentId || !departmentName) {
    res.status(400).json({
      success: false,
      message: "No department is associated with this HOD account.",
    });
    return null;
  }

  return { departmentId, departmentName, departmentShortCode };
};

export const getHodDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const ctx = requireDeptContext(req, res);
    if (!ctx) return;

    const erpId = req.authUser?.erpId;
    const dashboard = await HodService.getDashboard(
      ctx.departmentId,
      ctx.departmentName,
      ctx.departmentShortCode,
      erpId
    );
    res.status(200).json({ success: true, ...dashboard });
  } catch (error) {
    console.error("[hod/dashboard] failed", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export const getHodStudentAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const ctx = requireDeptContext(req, res);
    if (!ctx) return;

    const data = await HodService.getStudentAttendance(ctx.departmentId);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("[hod/students] failed", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export const getHodStaffAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const ctx = requireDeptContext(req, res);
    if (!ctx) return;

    const data = await HodService.getStaffAttendance(ctx.departmentId, ctx.departmentName, ctx.departmentShortCode);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("[hod/staff] failed", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};