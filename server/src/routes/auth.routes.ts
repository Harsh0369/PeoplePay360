import { Router } from "express";
import { loginController, registerInitialAdminController, getMeController, registerUserController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// Public Routes
router.post("/login", loginController);
router.post("/register", registerUserController); // Public sign up
router.post("/setup-admin", registerInitialAdminController); // Only works when 0 users exist

// Protected Routes
router.use(authMiddleware);
router.get("/me", requirePermission(), getMeController); // Any logged in user can fetch their profile

export default router;
