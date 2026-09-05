import { Router } from "express";
import { 
  getAllRolesController, 
  getRoleByIdController, 
  createRoleController, 
  updateRoleController, 
  deleteRoleController 
} from "../controllers/role.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// All role routes require authentication and Admin privileges (since Roles are system-level configs)
router.use(authMiddleware);

router.get("/", requirePermission("Settings.Read"), getAllRolesController);
router.get("/:id", requirePermission("Settings.Read"), getRoleByIdController);
router.post("/", requirePermission("Settings.Write"), createRoleController);
router.put("/:id", requirePermission("Settings.Write"), updateRoleController);
router.delete("/:id", requirePermission("Settings.Write"), deleteRoleController);

export default router;
