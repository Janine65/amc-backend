import { NextFunction, Request, Response } from 'express';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { logger } from '@utils/logger';

export const ErrorMiddleware = (error: GlobalHttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};
