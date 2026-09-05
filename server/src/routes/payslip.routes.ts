import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  getPayslipsController,
  getPayslipDetailController,
} from "../controllers/payslip.controller";

const router = Router();

router.use(authMiddleware);

// HR/Admin can view all payslips; employees can filter by their own employeeId
router.get("/", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write"), getPayslipsController);
router.get("/:id", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write"), getPayslipDetailController);

export default router;
