import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface RequestWithId extends Request {
  id?: string;
  startTime?: number;
}

/**
 * Request ID Middleware
 * Assigns or propagates X-Request-Id header for distributed tracing and reliability
 */
export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction) {
  const existingId = req.headers['x-request-id'];
  const requestId = typeof existingId === 'string' && existingId.trim().length > 0
    ? existingId.trim()
    : crypto.randomUUID();

  req.id = requestId;
  req.startTime = Date.now();
  res.setHeader('X-Request-Id', requestId);

  next();
}
