import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { mountRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware';
import { requestLogger } from './middleware/request-logger.middleware';

const app = express();

// --- Body parsing ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- CORS ---
const allowedOrigins = config.nodeEnv === 'production'
    ? (config.cors.origins ? config.cors.origins.split(',').map(o => o.trim()).filter(Boolean) : [])
    : true;

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// --- Request Logging ---
app.use(requestLogger);

// --- Routes ---
mountRoutes(app);

// --- Error handling (always last) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
