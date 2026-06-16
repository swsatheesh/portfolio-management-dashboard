import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

export async function seedDevelopmentUser(dataSource: DataSource) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const userRepository = dataSource.getRepository(UserEntity);

  const existingUser = await userRepository.findOne({
    where: { email: 'admin@test.com' },
  });

  if (existingUser) {
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  await userRepository.save({
    email: 'admin@test.com',
    fullName: 'Admin User',
    passwordHash,
  });
}