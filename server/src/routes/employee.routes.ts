import { Router } from "express";
import { getProfileController, createEmployeeController } from "../controllers/employee.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

router.use(authMiddleware);

// Get my own profile (Any logged in user who is an employee)
router.get("/me", getProfileController);

// Manage employees (HR Manager / Admin)
router.post("/", requirePermission("Employee.Write"), createEmployeeController);

export default router;
