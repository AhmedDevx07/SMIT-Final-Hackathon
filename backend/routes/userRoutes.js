import express from "express";
import { loginUser, getUsers } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/", protect, authorize("Admin"), getUsers);

export default router;
