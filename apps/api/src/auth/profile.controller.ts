import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { UserEntity } from '../entities/user.entity';
import { asyncHandler } from '../middleware/async-handler';
import { getAuthenticatedUser } from './get-authenticated-user';
import { ProfileService } from './profile.service';

export class ProfileController {
  private readonly profileService: ProfileService;

  constructor(
    userRepository: Repository<UserEntity> =
      AppDataSource.getRepository(UserEntity)
  ) {
    this.profileService = new ProfileService(
      userRepository
    );
  }

  getCurrentUser = asyncHandler(
    async (req: Request, res: Response) => {
      const authenticatedUser =
        getAuthenticatedUser(req);

      const user =
        await this.profileService.getCurrentUser(
          authenticatedUser.id
        );

      return res.status(200).json({
        user,
      });
    }
  );
}