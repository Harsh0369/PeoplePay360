import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import { getBusinessLogsController } from "../controllers/business-log.controller";

const router = Router();

router.use(authMiddleware);

// Only admins or users with Audit.Read can view business logs
router.get("/", requireAnyPermission("Audit.Read"), getBusinessLogsController);

export default router;
