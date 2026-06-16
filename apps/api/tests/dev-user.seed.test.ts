import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { seedDevelopmentUser } from '../src/seeds/dev-user.seed';

describe('seedDevelopmentUser', () => {
  const originalEnv = process.env;

  const userRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const dataSource = {
    getRepository: jest.fn(() => userRepository),
  } as unknown as DataSource;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'development';

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates admin user when user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);
    userRepository.save.mockResolvedValue({});

    await seedDevelopmentUser(dataSource);

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'admin@test.com' },
    });

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@test.com',
        fullName: 'Admin User',
      })
    );

    const savedUser = userRepository.save.mock.calls[0][0];
    const isPasswordValid = await bcrypt.compare(
      'password123',
      savedUser.passwordHash
    );

    expect(isPasswordValid).toBe(true);
  });

  it('does not create user when admin already exists', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
    });

    await seedDevelopmentUser(dataSource);

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('does not seed user in production', async () => {
    process.env.NODE_ENV = 'production';

    await seedDevelopmentUser(dataSource);

    expect(dataSource.getRepository).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});