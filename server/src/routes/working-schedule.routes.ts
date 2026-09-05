import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  createWorkingScheduleController,
  getWorkingSchedulesController,
  updateWorkingScheduleController
} from "../controllers/working-schedule.controller";

const router = Router();

router.use(authMiddleware);

// Only HR/Admin can manage working schedules
router.post("/", requireAnyPermission("admin", "org.manage"), createWorkingScheduleController);
router.get("/", getWorkingSchedulesController);
router.put("/:id", requireAnyPermission("admin", "org.manage"), updateWorkingScheduleController);

export default router;
