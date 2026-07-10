import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { AuthService } from '../src/auth/auth.service';
import { UserEntity } from '../src/entities/user.entity';
import { UnauthorizedError } from '../src/errors/api-error';

type MockUserRepository = {
  findOne: jest.Mock;
};

describe('AuthService', () => {
  let userRepository: MockUserRepository;
  let authService: AuthService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1d';

    userRepository = {
      findOne: jest.fn(),
    };

    authService = new AuthService(
      userRepository as unknown as Repository<UserEntity>
    );
  });

  it('validates a user with correct credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
      passwordHash,
    } as UserEntity);

    const user = await authService.validateUser({
      email: 'admin@test.com',
      password: 'password123',
    });

    expect(user).toEqual({
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
    });
  });

  it('returns error when user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    try {
      const user = await authService.validateUser({
        email: 'missing@test.com',
        password: 'password123',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      if (error instanceof UnauthorizedError) {
        expect(error.message).toBe('Invalid email or password');
      }
    }


  });

  it('returns error when password is invalid', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
      passwordHash,
    } as UserEntity);

    try {
      const user = await authService.validateUser({
        email: 'admin@test.com',
        password: 'wrong-password',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      if (error instanceof UnauthorizedError) {
        expect(error.message).toBe('Invalid email or password');
      }
    }


  });

  it('generates a valid JWT token', () => {
    const token = authService.generateToken({
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
    });

    const decoded = jwt.verify(token, 'test-secret') as jwt.JwtPayload;

    expect(decoded.sub).toBe('user-1');
    expect(decoded.email).toBe('admin@test.com');
  });
});