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

// Read — requires Contract.Read
router.get("/", requireAnyPermission("Contract.Read"), getContractsController);
router.get("/applicable/:employeeId", requireAnyPermission("Contract.Read"), getApplicableContractController);

// Write — requires Contract.Write
router.post("/", requireAnyPermission("Contract.Write"), createContractController);
router.put("/:id", requireAnyPermission("Contract.Write"), updateContractController);

export default router;
