import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getAuthConfig } from '../config/auth.config';

interface JwtPayload {
  sub: string;
  email: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(
      token,
      getAuthConfig().jwtSecret
    ) as JwtPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
}