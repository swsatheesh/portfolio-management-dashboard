import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from './app';
import { AppDataSource } from './data-source';

dotenv.config();

const port = Number(process.env.API_PORT ?? 3000);

async function bootstrap() {
  await AppDataSource.initialize();

  const app = createApp();

  app.listen(port, '0.0.0.0', () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start API server', error);
  process.exit(1);
});