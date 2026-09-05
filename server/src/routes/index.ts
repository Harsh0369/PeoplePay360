import { Router, Express } from 'express';
import authRoutes from './auth.routes';
import roleRoutes from './role.routes';
import employeeRoutes from './employee.routes';
import attendanceRoutes from './attendance.routes';
import timeOffRoutes from './time-off.routes';
import payrollConfigRoutes from './payroll-config.routes';
import departmentRoutes from './department.routes';
import jobPositionRoutes from './job-position.routes';

export const mountRoutes = (app: Express) => {
    const router = Router();

    router.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date() });
    });

    router.use('/auth', authRoutes);
    router.use('/roles', roleRoutes);
    router.use('/employees', employeeRoutes);
    router.use('/attendance', attendanceRoutes);
    router.use('/time-off', timeOffRoutes);
    router.use('/payroll-config', payrollConfigRoutes);
    router.use('/departments', departmentRoutes);
    router.use('/job-positions', jobPositionRoutes);

    app.use('/api/v1', router);
};
