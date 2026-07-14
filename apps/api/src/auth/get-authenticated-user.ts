import { Request } from 'express';
import { UnauthorizedError } from '../errors/api-error';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export function getAuthenticatedUser(
  req: Request
): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError('Authentication is required');
  }

  return req.user;
}