import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'peoplepay360', time: new Date().toISOString() });
});

// Feature routes are mounted here as they are built (Step 4+).
// app.use('/api/auth', authRoutes); etc.

app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.path }));
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;
