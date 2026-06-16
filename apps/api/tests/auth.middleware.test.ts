import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { authMiddleware } from '../src/auth/auth.middleware';

describe('authMiddleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('attaches user to request', () => {
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

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.user).toEqual({
      id: 'user-1',
      email: 'admin@test.com',
    });

    expect(next).toHaveBeenCalled();
  });

  it('returns unauthorized without token', () => {
    const req = {
      headers: {},
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});