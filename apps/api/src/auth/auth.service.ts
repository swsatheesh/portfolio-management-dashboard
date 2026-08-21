import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { appConfig } from '../config/auth.config';
import { UserEntity } from '../entities/user.entity';
import { AuthUser, JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedError } from '../errors/api-error';

export class AuthService {
  constructor(private readonly userRepository: Repository<UserEntity>) {}

  async validateUser(dto: LoginDto): Promise<AuthUser | null> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  }

  generateToken(user: AuthUser): string {
    const { jwtSecret, jwtExpiresIn } = appConfig;

    const payload: JwtPayload = {
      email: user.email,
    };

    const options: SignOptions = {
      subject: user.id,
      expiresIn: jwtExpiresIn as SignOptions['expiresIn'],
      issuer: 'portfolio-management-api',
      audience: 'portfolio-management-web',
    };

    return jwt.sign(payload, jwtSecret, options);
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto) as AuthUser;

    return {
      accessToken: this.generateToken(user),
      tokenType: 'Bearer',
      expiresIn: appConfig.jwtExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}