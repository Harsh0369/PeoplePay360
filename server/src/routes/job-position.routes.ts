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

// Organization management requires admin or hr permissions
router.post("/", requireAnyPermission("admin", "org.manage"), createJobPositionController);
router.get("/", getJobPositionsController);
router.post("/employee/:employeeId/assign", requireAnyPermission("admin", "org.manage"), assignEmployeeJobPositionController);

export default router;
