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

// HR/Admin or Contract.Write permissions
router.post("/", requireAnyPermission("admin", "org.manage", "Contract.Write"), createContractController);
router.get("/", getContractsController);
router.get("/applicable/:employeeId", getApplicableContractController);
router.put("/:id", requireAnyPermission("admin", "org.manage", "Contract.Write"), updateContractController);

export default router;
