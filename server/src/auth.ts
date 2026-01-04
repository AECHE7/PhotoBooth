import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'secret-key-change-me';

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return next(); // Allow optional auth (public gallery vs private)

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return next(); // Invalid token, treat as guest
    req.user = user;
    next();
  });
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    next();
};
