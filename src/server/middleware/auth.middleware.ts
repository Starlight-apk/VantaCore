import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vantacore-secret-key-change-in-production';

interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    res.status(500).json({ error: 'Authentication error' });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  const requests: Map<string, Array<number>> = new Map();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const ipRequests = requests.get(ip)!;
    ipRequests.push(now);

    // Remove old requests
    const validRequests = ipRequests.filter((time) => now - time < windowMs);
    requests.set(ip, validRequests);

    if (validRequests.length > maxRequests) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    next();
  };
}
