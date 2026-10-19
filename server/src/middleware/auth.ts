import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../services/supabaseService.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Authentication Middleware:
 * Verifies Supabase Bearer JWT token if Supabase is connected.
 * In local development, provides a realistic simulated learner user session.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const supabase = SupabaseService.getClient();

    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
      }

      req.user = {
        id: user.id,
        email: user.email || 'learner@mentorvoice.dev'
      };
      return next();
    }
  }

  // Development Fallback: Simulated active user
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'krish@mentorvoice.dev'
  };
  return next();
}
