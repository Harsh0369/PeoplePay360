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

// Only Admins or Payroll Managers can configure payroll rules
router.use(authMiddleware, requireAnyPermission("admin", "payroll.manage"));

// Salary Rules
router.post("/rules", createSalaryRuleController);
router.get("/rules", getSalaryRulesController);
router.patch("/rules/:id", updateSalaryRuleController);
router.delete("/rules/:id", deleteSalaryRuleController);

// Salary Structures
router.post("/structures", createSalaryStructureController);
router.get("/structures", getSalaryStructuresController);
router.patch("/structures/:id", updateSalaryStructureController);
router.delete("/structures/:id", deleteSalaryStructureController);

export default router;
