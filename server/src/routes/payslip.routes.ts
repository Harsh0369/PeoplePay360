import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  getPayslipsController,
  getPayslipDetailController,
  getMyPayslipsController,
  getPayslipPdfController,
} from "../controllers/payslip.controller";

const router = Router();

router.use(authMiddleware);

// Employee specific route - must come before /:id to avoid matching "my" as an ID
router.get("/my", requireAnyPermission("Employee.Read"), getMyPayslipsController);

// HR/Admin can view all payslips; employees can filter by their own employeeId
router.get("/", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write"), getPayslipsController);
router.get("/:id", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write", "Employee.Read"), getPayslipDetailController);
router.get("/:id/pdf", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write", "Employee.Read"), getPayslipPdfController);

export default router;
