import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  createPayrunController,
  computePayrunController,
  validatePayrunController,
  markPaidPayrunController,
  getPayrunsController,
  getPayrunDetailController,
  cancelPayrunController,
  getEligibleEmployeesController,
  sendPayrunController,
} from "../controllers/payrun.controller";

const router = Router();

router.use(authMiddleware);

// All payrun operations require Payroll.Write or admin
router.post("/", requireAnyPermission("admin", "Payroll.Write"), createPayrunController);
router.post("/:id/compute", requireAnyPermission("admin", "Payroll.Write"), computePayrunController);
router.post("/:id/validate", requireAnyPermission("admin", "Payroll.Write"), validatePayrunController);
router.post("/:id/mark-paid", requireAnyPermission("admin", "Payroll.Write"), markPaidPayrunController);
router.post("/:id/send", requireAnyPermission("admin", "Payroll.Write"), sendPayrunController);
router.post("/:id/cancel", requireAnyPermission("admin", "Payroll.Write"), cancelPayrunController);

// Read access for payroll users
router.get("/", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write"), getPayrunsController);
router.get("/:id", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write"), getPayrunDetailController);
router.get("/:id/eligible-employees", requireAnyPermission("admin", "Payroll.Read", "Payroll.Write"), getEligibleEmployeesController);

export default router;
