import { Request, Response } from "express";
import { StudentAttendanceService } from "../services";

export const getStudentAttendance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const erpId = req.authUser?.erpId;

    if (!erpId) {
      res.status(401).json({
        error: "Unauthorized.",
      });
      return;
    }

    const attendance =
      await StudentAttendanceService.getAttendance(erpId);

    res.status(200).json(attendance);
  } catch (error) {
    console.error("[student attendance]", error);

    res.status(500).json({
      error: "Failed to fetch attendance.",
    });
  }
};   // <-- IMPORTANT: this semicolon closes the first function

export const getSubjectAttendanceHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const erpId = req.authUser?.erpId;

    if (!erpId) {
      res.status(401).json({
        error: "Unauthorized.",
      });
      return;
    }

    const subjectId = Number(req.params.subjectId);

    if (Number.isNaN(subjectId)) {
      res.status(400).json({
        error: "Invalid subject id.",
      });
      return;
    }

    const history =
      await StudentAttendanceService.getSubjectHistory(
        erpId,
        subjectId,
      );

    res.status(200).json(history);
    console.log("Subject History API Called");
    console.log("ERP:", erpId);
    console.log("Subject ID:", subjectId);
  } catch (error) {
    console.error("[subject attendance history]", error);

    res.status(500).json({
      error: "Failed to fetch subject attendance history.",
    });
  }
};