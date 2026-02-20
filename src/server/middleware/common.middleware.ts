import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
});

export const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
});

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  const status = (err as any).status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: {
      message,
      status,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      status: 404,
    },
  });
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}
