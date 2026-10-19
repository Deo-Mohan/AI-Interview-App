import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface IdempotencyRecord {
  status: 'PENDING' | 'RESOLVED' | 'FAILED';
  statusCode?: number;
  body?: any;
  createdAt: number;
  promise?: Promise<any>;
}

export class IdempotencyService {
  private static cache = new Map<string, IdempotencyRecord>();
  private static TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Derive or extract idempotency key
   */
  static getKey(req: Request, customKey?: string): string {
    if (customKey) return customKey;
    const headerKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
    if (typeof headerKey === 'string' && headerKey.trim().length > 0) {
      return headerKey.trim();
    }
    // Fallback: Hash path + body
    const bodyStr = JSON.stringify(req.body || {});
    return crypto.createHash('sha256').update(`${req.originalUrl || req.url}:${bodyStr}`).digest('hex');
  }

  /**
   * Check if a request has already been executed or is currently in flight
   */
  static get(key: string): IdempotencyRecord | undefined {
    const record = this.cache.get(key);
    if (!record) return undefined;
    if (Date.now() - record.createdAt > this.TTL_MS) {
      this.cache.delete(key);
      return undefined;
    }
    return record;
  }

  /**
   * Mark a request as currently processing
   */
  static setPending(key: string): void {
    this.cache.set(key, {
      status: 'PENDING',
      createdAt: Date.now()
    });
  }

  /**
   * Store completed result
   */
  static setResolved(key: string, statusCode: number, body: any): void {
    this.cache.set(key, {
      status: 'RESOLVED',
      statusCode,
      body,
      createdAt: Date.now()
    });
  }

  /**
   * Clear failed request so client can retry
   */
  static delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all records (useful for testing)
   */
  static clear(): void {
    this.cache.clear();
  }
}

/**
 * Express middleware to prevent duplicate operations (e.g. Generate Notes)
 */
export function idempotencyMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply to POST / PUT / PATCH
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }

    const key = IdempotencyService.getKey(req);
    const existing = IdempotencyService.get(key);

    if (existing) {
      if (existing.status === 'RESOLVED') {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Idempotency-Key', key);
        return res.status(existing.statusCode || 200).json(existing.body);
      }
      if (existing.status === 'PENDING') {
        return res.status(409).json({
          error: 'Conflict',
          message: 'A request with this idempotency key is currently being processed.',
          idempotencyKey: key
        });
      }
    }

    IdempotencyService.setPending(key);

    // Intercept res.json to capture response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        IdempotencyService.setResolved(key, res.statusCode, body);
      } else {
        IdempotencyService.delete(key);
      }
      res.setHeader('X-Idempotency-Key', key);
      return originalJson(body);
    };

    next();
  };
}
