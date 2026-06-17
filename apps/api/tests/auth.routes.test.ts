import bcrypt from 'bcryptjs';
import request from 'supertest';
import { Repository } from 'typeorm';
import { createApp } from '../src/app';
import { AuthController } from '../src/auth/auth.controller';
import { UserEntity } from '../src/entities/user.entity';

type MockUserRepository = {
  findOne: jest.Mock;
};

describe('POST /api/auth/login', () => {
  let userRepository: MockUserRepository;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1d';

    userRepository = {
      findOne: jest.fn(),
    };
  });

  function createTestApp() {
    const app = createApp();

    const authController = new AuthController(
      userRepository as unknown as Repository<UserEntity>
    );

    app.post('/test/auth/login', authController.login);

    return app;
  }

  it('returns access token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
      passwordHash,
    } as UserEntity);

    const response = await request(createTestApp())
      .post('/test/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user).toEqual({
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
    });
  });

  it('returns 401 for invalid credentials', async () => {
    userRepository.findOne.mockResolvedValue(null);

    const response = await request(createTestApp())
      .post('/test/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'wrong-password',
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Invalid email or password',
    });
  });

  it('returns 400 when email is missing', async () => {
    const response = await request(createTestApp())
      .post('/test/auth/login')
      .send({
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Email and password are required',
    });
  });

  it('returns 400 when password is missing', async () => {
    const response = await request(createTestApp())
      .post('/test/auth/login')
      .send({
        email: 'admin@test.com',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Email and password are required',
    });
  });
});