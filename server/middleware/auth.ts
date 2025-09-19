import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';
import { storage } from '../storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const payload = AuthService.verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Verify user still exists
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
}
