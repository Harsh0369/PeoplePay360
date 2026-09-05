import { Router, Express } from 'express';
import authRoutes from './auth.routes';
import roleRoutes from './role.routes';
import employeeRoutes from './employee.routes';
import attendanceRoutes from './attendance.routes';
import contractRoutes from './contract.routes';

export const mountRoutes = (app: Express) => {
    const router = Router();

    router.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date() });
    });

    router.use('/auth', authRoutes);
    router.use('/roles', roleRoutes);
    router.use('/employees', employeeRoutes);
    router.use('/attendance', attendanceRoutes);
    router.use('/contracts', contractRoutes);

    app.use('/api/v1', router);
};
