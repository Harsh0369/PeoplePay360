import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  createContractController,
  getContractsController,
  updateContractController,
  getApplicableContractController
} from "../controllers/contract.controller";

const router = Router();

router.use(authMiddleware);

// Only HR/Admin can manage contracts
router.post("/", requireAnyPermission("admin", "org.manage"), createContractController);
router.get("/", requireAnyPermission("admin", "org.manage"), getContractsController);
router.put("/:id", requireAnyPermission("admin", "org.manage"), updateContractController);
router.get("/:employeeId/applicable", requireAnyPermission("admin", "org.manage"), getApplicableContractController);

export default router;
