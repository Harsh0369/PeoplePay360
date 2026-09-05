import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  getPayslipsController,
  getPayslipDetailController,
  getMyPayslipsController,
  getPayslipPdfController,
  getMyPayslipPdfController,
} from "../controllers/payslip.controller";

const router = Router();

router.use(authMiddleware);

// Employee specific routes - strictly for self-service
router.get("/my", getMyPayslipsController);
router.get("/my/:id/pdf", getMyPayslipPdfController);

// HR/Admin can view all payslips
router.get("/", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write"), getPayslipsController);
router.get("/:id", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write"), getPayslipDetailController);
router.get("/:id/pdf", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write"), getPayslipPdfController);

export default router;
