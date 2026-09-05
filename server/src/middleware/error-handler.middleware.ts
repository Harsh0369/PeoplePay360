import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.util';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 500) {
    Logger.error('Unhandled Exception', { error: err.message, stack: err.stack });
  } else {
    Logger.warn(`[${statusCode}] ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
