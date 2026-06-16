import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { getAuthConfig } from '../config/auth.config';
import { UserEntity } from '../entities/user.entity';
import { AuthUser, JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';

export class AuthService {
  constructor(private readonly userRepository: Repository<UserEntity>) {}

  async validateUser(dto: LoginDto): Promise<AuthUser | null> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  }

  generateToken(user: AuthUser): string {
    const { jwtSecret, jwtExpiresIn } = getAuthConfig();

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const options: SignOptions = {
      expiresIn: jwtExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, jwtSecret, options);
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);

    if (!user) return null;

    return {
      accessToken: this.generateToken(user),
      user,
    };
  }
}