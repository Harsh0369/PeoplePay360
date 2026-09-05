import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  raiseTimeOffRequestController,
  reviewTimeOffRequestController,
  adminOverrideRequestController,
} from "../controllers/time-off.controller";

const router = Router();

// Employee routes
router.post("/request", authMiddleware, raiseTimeOffRequestController);

// Manager/Admin routes
router.post("/:id/review", authMiddleware, reviewTimeOffRequestController);
router.post("/:id/admin-override", authMiddleware, adminOverrideRequestController);

export default router;
