import express from "express";
import {
  submitReport,
  getAllReports,
  updateReportStatus,
} from "../controllers/reportController.js";

const router = express.Router();

// Submit a report
router.post("/report", (req, res, next) => {
  console.log("POST /report called");
  submitReport(req, res, next);
});

// Get all reports (for admin)
router.get("/reports", (req, res, next) => {
  console.log("GET /reports called");
  getAllReports(req, res, next);
});

// Update report status (for admin)
router.put("/reports/:reportId/status", (req, res, next) => {
  console.log(`PUT /reports/${req.params.reportId}/status called`);
  updateReportStatus(req, res, next);
});

export default router;
