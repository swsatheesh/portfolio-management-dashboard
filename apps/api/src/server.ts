import 'reflect-metadata';
import { createApp } from './app';
import { appConfig } from './config/auth.config';
import { AppDataSource } from './data-source';
import { runSeeds } from './seeds/seed';

async function bootstrap() {
  await AppDataSource.initialize();

  await runSeeds(AppDataSource);

  const app = createApp();

  app.listen(appConfig.port, '0.0.0.0', () => {
    console.log(`API server running on http://localhost:${appConfig.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start API server', error);
  process.exit(1);
});