import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.util';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Validation Error vs Custom Validation Error
  if (err.name === 'ValidationError') {
    statusCode = err.statusCode || 400;
    if (err.errors) {
      const errors = Object.values(err.errors).map((el: any) => el.message);
      message = `Invalid input data. ${errors.join('. ')}`;
    } else {
      message = err.message || 'Validation failed';
    }
  }

  // Handle Mongoose CastError (Invalid ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}.`;
  }

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
