import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * In-memory sliding window rate limiter
 * Enforces per-client request limits and outputs standard RFC-compliant Retry-After headers
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const store = new Map<string, RateLimitRecord>();
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = options;

  // Cleanup expired buckets every minute
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 60000);
  if (cleanupInterval.unref) cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : (req as AuthenticatedRequest).user?.id || req.ip || req.socket.remoteAddress || 'unknown-client';

    const now = Date.now();
    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfterSeconds: resetSeconds,
        limit: maxRequests,
        windowMs
      });
    }

    next();
  };
}
