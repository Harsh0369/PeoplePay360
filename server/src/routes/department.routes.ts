import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  createDepartmentController,
  getDepartmentsController,
  assignEmployeeDepartmentController
} from "../controllers/department.controller";

const router = Router();

router.use(authMiddleware);

// Organization management requires admin or hr permissions
router.post("/", requireAnyPermission("admin", "org.manage"), createDepartmentController);
router.get("/", getDepartmentsController);
router.post("/employee/:employeeId/assign", requireAnyPermission("admin", "org.manage"), assignEmployeeDepartmentController);

export default router;
