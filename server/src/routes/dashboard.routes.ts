import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import { getDashboardStatsController } from "../controllers/dashboard.controller/get-dashboard-stats.controller";

const router = Router();

// /api/v1/dashboard
router.use(authMiddleware);

router.get(
  "/stats",
  requireAnyPermission("Dashboard.Read", "Employee.Read"), // Require some basic read permission
  getDashboardStatsController
);

export default router;
