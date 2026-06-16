import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { UserEntity } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

export class AuthController {
  private readonly authService: AuthService;

  constructor(
    userRepository: Repository<UserEntity> = AppDataSource.getRepository(UserEntity)
  ) {
    this.authService = new AuthService(userRepository);
  }

  login = async (req: Request, res: Response) => {
    const dto = req.body as LoginDto;

    if (!dto.email || !dto.password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const result = await this.authService.login(dto);

    if (!result) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    return res.status(200).json(result);
  };
}