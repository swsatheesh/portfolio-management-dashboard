import { DataSource } from 'typeorm';
import { seedDevelopmentUser } from './user.seed';
import { seedInvestments } from './seed-investments';
import { seedTransactions } from './seed-transactions';

export async function runSeeds(dataSource: DataSource) {
  const shouldSeed =
    process.env.NODE_ENV !== 'production' &&
    process.env.ENABLE_DEVELOPMENT_SEED === 'true';

  if (!shouldSeed) {
    return;
  }

  console.log('[seed] Running development seeds');

  await seedDevelopmentUser(dataSource);
  await seedInvestments(dataSource);
  await seedTransactions(dataSource);

  console.log('[seed] Development seeds completed');
}