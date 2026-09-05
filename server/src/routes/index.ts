import { Router, Express } from 'express';
import authRoutes from './auth.routes';
import roleRoutes from './role.routes';

export const mountRoutes = (app: Express) => {
    const router = Router();

    router.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date() });
    });

    router.use('/auth', authRoutes);
    router.use('/roles', roleRoutes);

    app.use('/api/v1', router);
};
