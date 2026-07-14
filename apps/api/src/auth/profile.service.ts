import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { NotFoundError } from '../errors/api-error';

export class ProfileService {
  constructor(
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}