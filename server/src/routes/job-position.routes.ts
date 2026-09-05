import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  createJobPositionController,
  getJobPositionsController,
  assignEmployeeJobPositionController
} from "../controllers/job-position.controller";

const router = Router();

router.use(authMiddleware);

// Read — requires Organization.Read
router.get("/", requireAnyPermission("Organization.Read"), getJobPositionsController);

// Write — requires Organization.Write
router.post("/", requireAnyPermission("Organization.Write"), createJobPositionController);
router.post("/employee/:employeeId/assign", requireAnyPermission("Organization.Write"), assignEmployeeJobPositionController);

export default router;
