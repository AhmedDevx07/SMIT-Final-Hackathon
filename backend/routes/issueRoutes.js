import express from "express";
import {
  triageComplaint,
  createIssue,
  assignIssue,
  updateIssueStatus,
  getIssues,
  getDashboardStats,
} from "../controllers/issueController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/triage", triageComplaint);
router.post("/create", createIssue);
router.get("/", protect, authorize("Admin", "Technician"), getIssues);
router.get(
  "/stats",
  protect,
  authorize("Admin", "Technician"),
  getDashboardStats,
);
router.put("/assign/:id", protect, authorize("Admin"), assignIssue);
router.put(
  "/status/:id",
  protect,
  authorize("Technician", "Admin"),
  updateIssueStatus,
);

export default router;
