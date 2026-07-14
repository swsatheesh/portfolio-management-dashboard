import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../src/auth/auth.middleware';
import { UnauthorizedError } from '../src/errors/api-error';

describe('authMiddleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  function createResponse(): Response {
    return {} as Response;
  }

  it('attaches user to request when token is valid', () => {
    const token = jwt.sign(
      {
        email: 'admin@test.com',
      },
      'test-secret',
      {
        subject: 'user-1',
        expiresIn: '1h',
      }
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    const res = {} as Response;
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authMiddleware(req, res, next);

    expect(req.user).toEqual({
      id: 'user-1',
      email: 'admin@test.com',
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('passes UnauthorizedError to next when authorization header is missing', () => {
    const req = {
      headers: {},
    } as Request;

    const res = createResponse();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: 'Authentication token is required',
    });

    expect(req.user).toBeUndefined();
  });

  it('passes UnauthorizedError to next when bearer token is empty', () => {
    const req = {
      headers: {
        authorization: 'Bearer ',
      },
    } as Request;

    const res = createResponse();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authMiddleware(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: 'Authentication token is required',
    });

    expect(req.user).toBeUndefined();
  });

  it('passes UnauthorizedError to next when token is invalid', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    } as Request;

    const res = createResponse();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: 'Invalid or expired authentication token',
    });

    expect(req.user).toBeUndefined();
  });

  it('passes UnauthorizedError to next when token is expired', () => {
    const token = jwt.sign(
      {
        email: 'admin@test.com',
      },
      'test-secret',
      {
        subject: 'user-1',
        expiresIn: -1,
      }
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    const res = createResponse();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authMiddleware(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: 'Invalid or expired authentication token',
    });

    expect(req.user).toBeUndefined();
  });

  it('passes UnauthorizedError to next when token payload is incomplete', () => {
    const token = jwt.sign(
      {},
      'test-secret',
      {
        subject: 'user-1',
      }
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    const res = createResponse();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    authMiddleware(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: 'Invalid authentication token',
    });

    expect(req.user).toBeUndefined();
  });
});