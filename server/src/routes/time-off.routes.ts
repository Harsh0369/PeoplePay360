import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import {
  raiseTimeOffRequestController,
  reviewTimeOffRequestController,
  adminOverrideRequestController,
  getTimeOffTypesController,
  createTimeOffTypeController,
  getTimeOffAllocationsController,
  createTimeOffAllocationController,
  getTimeOffRequestsController,
} from "../controllers/time-off.controller";

const router = Router();

router.use(authMiddleware);

// --- Time Off Types ---
router.get("/types", requireAnyPermission("TimeOff.Read"), getTimeOffTypesController);
router.post("/types", requireAnyPermission("TimeOff.Write"), createTimeOffTypeController);

// --- Time Off Allocations ---
router.get("/allocations", requireAnyPermission("TimeOff.Read"), getTimeOffAllocationsController);
router.post("/allocations", requireAnyPermission("TimeOff.Write"), createTimeOffAllocationController);

// --- Time Off Requests ---
router.get("/requests", requireAnyPermission("TimeOff.Read"), getTimeOffRequestsController);

// Employee self-service: raise a request (any authenticated employee)
router.post("/request", raiseTimeOffRequestController);

// Manager/Admin review — requires TimeOff.Approve
router.post("/:id/review", requireAnyPermission("TimeOff.Approve"), reviewTimeOffRequestController);

// Admin override — requires TimeOff.Write (higher privilege than approve)
router.post("/:id/admin-override", requireAnyPermission("TimeOff.Write"), adminOverrideRequestController);

export default router;
