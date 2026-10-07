import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getProfile,
  updatePreferences,
  getHistory,
  deleteHistory,
} from "../controllers/userController.js";

const router = Router();

// Profile & Preferences
router.get("/profile", authenticateToken, getProfile);
router.put("/preferences", authenticateToken, updatePreferences);

// History
router.get("/history", authenticateToken, getHistory);
router.delete("/history/:id", authenticateToken, deleteHistory);

export default router;
