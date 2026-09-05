import { Router } from "express";
import { clockInController, clockOutController } from "../controllers/attendance.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All attendance tracking requires auth
router.use(authMiddleware);

// Any user linked to an employee can clock in/out
router.post("/clock-in", clockInController);
router.post("/clock-out", clockOutController);

export default router;
