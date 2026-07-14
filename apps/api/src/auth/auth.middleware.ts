import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { appConfig } from '../config/auth.config';
import { UnauthorizedError } from '../errors/api-error';
interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token is required'));
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    return next(new UnauthorizedError('Authentication token is required'));
  }

  try {
    const payload = jwt.verify(
      token,
      appConfig.jwtSecret
    ) as AccessTokenPayload;

    if (!payload.sub || !payload.email) {
      return next(new UnauthorizedError('Invalid authentication token'));
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}