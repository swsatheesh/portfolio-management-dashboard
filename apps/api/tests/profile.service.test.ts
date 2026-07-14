import { Repository } from 'typeorm';
import { UserEntity } from '../src/entities/user.entity';
import { NotFoundError } from '../src/errors/api-error';
import { ProfileService } from '../src/auth/profile.service';

type MockUserRepository = {
  findOne: jest.Mock;
};

describe('ProfileService', () => {
  let userRepository: MockUserRepository;
  let service: ProfileService;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    };

    service = new ProfileService(
      userRepository as unknown as Repository<UserEntity>
    );
  });

  it('returns the authenticated user', async () => {
    const user = {
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
      createdAt: new Date('2026-01-01'),
    } as UserEntity;

    userRepository.findOne.mockResolvedValue(user);

    const result = await service.getCurrentUser('user-1');

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });

    expect(result).toEqual(user);
  });

  it('throws NotFoundError when the authenticated user no longer exists', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getCurrentUser('missing-user')
    ).rejects.toThrow(new NotFoundError('User not found'));
  });
});