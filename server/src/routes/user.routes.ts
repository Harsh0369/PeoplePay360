import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAnyPermission } from "../middleware/permission.middleware";
import { getJoinRequestsController, updateUserRoleController } from "../controllers/user.controller";

const router = Router();

router.use(authMiddleware);

// Only Admin or Settings.Write can view join requests and update roles
router.get("/join-requests", requireAnyPermission("admin", "Settings.Write"), getJoinRequestsController);
router.put("/:id/role", requireAnyPermission("admin", "Settings.Write"), updateUserRoleController);

export default router;
