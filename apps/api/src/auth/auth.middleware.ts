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
      appConfig.jwtSecret,
      {
        issuer: 'portfolio-management-api',
        audience: 'portfolio-management-web',
      }
    ) as AccessTokenPayload;

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      return next(new UnauthorizedError('Invalid authentication token'));
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new UnauthorizedError(
          'Authentication token has expired'
        )
      );
    }

    return next(new UnauthorizedError('Invalid authentication token'));
  }
}