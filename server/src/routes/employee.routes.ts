import { Router } from "express";
import { getProfileController, createEmployeeController, getAllEmployeesController, getEmployeeDetailController } from "../controllers/employee.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission, requirePermission } from "../middleware/permission.middleware";

const router = Router();

// All employee routes require authentication
router.use(authMiddleware);

// List all employees — requires Employee.Read
router.get("/", requireAnyPermission("Employee.Read"), getAllEmployeesController);

// Get own profile — any authenticated user
router.get("/me", requirePermission(), getProfileController);

// Get employee detail (smart-button hub) — requires Employee.Read
router.get("/:id", requireAnyPermission("Employee.Read"), getEmployeeDetailController);

// Create employee — requires Employee.Write
router.post("/", requireAnyPermission("Employee.Write"), createEmployeeController);

export default router;
