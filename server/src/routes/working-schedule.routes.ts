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

// Read — requires Organization.Read
router.get("/", requireAnyPermission("Organization.Read"), getWorkingSchedulesController);

// Write — requires Organization.Write
router.post("/", requireAnyPermission("Organization.Write"), createWorkingScheduleController);
router.put("/:id", requireAnyPermission("Organization.Write"), updateWorkingScheduleController);

export default router;
