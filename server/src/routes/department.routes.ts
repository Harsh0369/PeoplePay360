import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  createDepartmentController,
  getDepartmentsController,
  assignEmployeeDepartmentController,
  updateDepartmentController,
  deleteDepartmentController
} from "../controllers/department.controller";

const router = Router();

router.use(authMiddleware);

// Read — requires Organization.Read
router.get("/", requireAnyPermission("Organization.Read"), getDepartmentsController);

// Write — requires Organization.Write
router.post("/", requireAnyPermission("Organization.Write"), createDepartmentController);
router.post("/employee/:employeeId/assign", requireAnyPermission("Organization.Write"), assignEmployeeDepartmentController);
router.put("/:id", requireAnyPermission("Organization.Write"), updateDepartmentController);
router.delete("/:id", requireAnyPermission("Organization.Write"), deleteDepartmentController);

export default router;
