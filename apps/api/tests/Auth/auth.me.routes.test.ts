import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Repository } from 'typeorm';
import { UserEntity } from '../../src/entities/user.entity';
import { ProfileController } from '../../src/auth/profile.controller';
import { authMiddleware } from '../../src/auth/auth.middleware';
import { errorHandler } from '../../src/middleware/error-handler';

type MockUserRepository = {
  findOne: jest.Mock;
};

describe('GET /api/auth/me', () => {
  let userRepository: MockUserRepository;

  beforeEach(() => {

    userRepository = {
      findOne: jest.fn(),
    };
  });

  function createTestApp() {
    const app = express();

    app.use(express.json());

    const profileController = new ProfileController(
      userRepository as unknown as Repository<UserEntity>
    );

    app.get(
      '/api/auth/me',
      authMiddleware,
      profileController.getCurrentUser
    );

    app.use(errorHandler);

    return app;
  }

  it('returns the authenticated user for a valid token', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
      createdAt: new Date('2026-01-01'),
    } as UserEntity);

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

    const response = await request(createTestApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.user).toEqual({
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('returns 401 when the token is missing', async () => {
    const response = await request(createTestApp())
      .get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe(
      'Authentication token is required'
    );
  });

  it('returns 401 when the token is invalid', async () => {
    const response = await request(createTestApp())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe(
      'Invalid authentication token'
    );
  });

  it('returns 401 when the token is expired', async () => {
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

    const response = await request(createTestApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});