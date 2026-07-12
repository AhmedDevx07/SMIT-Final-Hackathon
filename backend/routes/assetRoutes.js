import express from "express";
import {
  createAsset,
  getAssets,
  getPublicAsset,
  updateAsset,
  deleteAsset,
  getAssetHistory,
  getMaintenanceRecords,
} from "../controllers/assetController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("Admin"), createAsset);
router.get("/", protect, authorize("Admin", "Technician"), getAssets);
router.get("/public/:assetCode", getPublicAsset);
router.put("/:id", protect, authorize("Admin"), updateAsset);
router.delete("/:id", protect, authorize("Admin"), deleteAsset);
router.get(
  "/:id/history",
  protect,
  authorize("Admin", "Technician"),
  getAssetHistory,
);
router.get(
  "/:id/maintenance-records",
  protect,
  authorize("Admin", "Technician"),
  getMaintenanceRecords,
);

export default router;
