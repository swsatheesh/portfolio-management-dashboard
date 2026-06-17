import { DataSource } from 'typeorm';
import { seedDevelopmentUser } from './user.seed';

export async function runSeeds(dataSource: DataSource) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  console.log('[seed] Running development seeds');

  await seedDevelopmentUser(dataSource);

  console.log('[seed] Development seeds completed');
}