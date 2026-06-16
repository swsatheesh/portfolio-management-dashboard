import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../src/auth/auth.middleware';

describe('authMiddleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  }

  it('attaches user to request when token is valid', () => {
    const token = jwt.sign(
      {
        sub: 'user-1',
        email: 'admin@test.com',
      },
      'test-secret'
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.user).toEqual({
      id: 'user-1',
      email: 'admin@test.com',
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 401 when authorization header is missing', () => {
    const req = {
      headers: {},
    } as Request;

    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    } as Request;

    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    });
    expect(next).not.toHaveBeenCalled();
  });
});