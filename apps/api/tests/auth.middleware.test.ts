import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Repository } from 'typeorm';
import express from 'express';
import { authMiddleware } from '../src/auth/auth.middleware';
import { ProfileController } from '../src/auth/profile.controller';
import { errorHandler } from '../src/middleware/error-handler';
import { UserEntity } from '../src/entities/user.entity';
import { UnauthorizedError } from '../src/errors/api-error';

type MockUserRepository = {
  findOne: jest.Mock;
};

describe('authMiddleware', () => {
  let userRepository: MockUserRepository;
  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    };
  });

  function createResponse(): Response {
    return {} as Response;
  }
  function createTestApp() {
    const app = express();

    app.use(express.json());

    const profileController = new ProfileController(
      userRepository as unknown as Repository<UserEntity>
    );

    app.get(
      '/test/auth/me',
      authMiddleware,
      profileController.getCurrentUser
    );

    app.use(errorHandler);

    return app;
  }

  it('attaches user to request when token is valid', () => {
    const token = jwt.sign(
      {
        email: 'admin@test.com',
      },
      process.env.JWT_SECRET!,
      {
        subject: 'user-1',
        expiresIn: '1h',
        issuer: 'portfolio-management-api',
        audience: 'portfolio-management-web',
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
      message: 'Invalid authentication token',
    });

    expect(req.user).toBeUndefined();
  });

  it('passes UnauthorizedError to next when token is expired', () => {
    const token = jwt.sign(
      {
        email: 'admin@test.com',
      },
      process.env.JWT_SECRET!,
      {
        subject: 'user-1',
        expiresIn: -1,
        issuer: 'portfolio-management-api',
        audience: 'portfolio-management-web',
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
      message: 'Authentication token has expired',
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

  it('rejects a token issued for another application', async () => {
    const token = jwt.sign(
      {
        email: 'admin@test.com',
      },
      process.env.JWT_SECRET!,
      {
        subject: 'user-1',
        expiresIn: '1h',
        issuer: 'another-api',
        audience: 'another-client',
      }
    );

    const response = await request(createTestApp())
      .get('/test/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe(
      'Invalid authentication token'
    );
  });
});
