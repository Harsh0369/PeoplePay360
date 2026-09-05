import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  createSalaryRuleController,
  getSalaryRulesController,
  updateSalaryRuleController,
  deleteSalaryRuleController,
} from "../controllers/salary-rule.controller";
import {
  createSalaryStructureController,
  getSalaryStructuresController,
  updateSalaryStructureController,
  deleteSalaryStructureController,
} from "../controllers/salary-structure.controller";

const router = Router();

router.use(authMiddleware);

// Salary Rules — Read vs Write split
router.get("/rules", requireAnyPermission("Payroll.Read"), getSalaryRulesController);
router.post("/rules", requireAnyPermission("Payroll.Write"), createSalaryRuleController);
router.patch("/rules/:id", requireAnyPermission("Payroll.Write"), updateSalaryRuleController);
router.delete("/rules/:id", requireAnyPermission("Payroll.Write"), deleteSalaryRuleController);

// Salary Structures — Read vs Write split
router.get("/structures", requireAnyPermission("Payroll.Read"), getSalaryStructuresController);
router.post("/structures", requireAnyPermission("Payroll.Write"), createSalaryStructureController);
router.patch("/structures/:id", requireAnyPermission("Payroll.Write"), updateSalaryStructureController);
router.delete("/structures/:id", requireAnyPermission("Payroll.Write"), deleteSalaryStructureController);

export default router;
