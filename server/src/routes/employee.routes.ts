import { Router } from "express";
import { getProfileController, createEmployeeController, getAllEmployeesController } from "../controllers/employee.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public/Dev List Employees
router.get("/", getAllEmployeesController);

// Authenticated Routes
router.use(authMiddleware);
router.get("/me", getProfileController);
router.post("/", createEmployeeController);

export default router;
