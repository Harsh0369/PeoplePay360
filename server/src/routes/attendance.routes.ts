import { Router } from "express";
import { clockInController, clockOutController, adminUpdateAttendanceController, getAttendanceController, getMyAttendanceController } from "../controllers/attendance.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission, requireAnyPermission } from "../middleware/permission.middleware";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware";

const router = Router();

// All attendance tracking requires auth
router.use(authMiddleware);

// List attendance records — requires Attendance.Read
router.get("/", requireAnyPermission("Attendance.Read"), getAttendanceController);

// Employee self-service
router.get("/my", getMyAttendanceController);

// Any user linked to an employee can clock in/out (protected by idempotency for network retries)
router.post("/clock-in", idempotencyMiddleware, clockInController);
router.post("/clock-out", idempotencyMiddleware, clockOutController);

// HR/Admin can manually update attendance records
router.put("/:id", requirePermission("Attendance.Write"), adminUpdateAttendanceController);

export default router;
