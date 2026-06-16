import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { authRouter } from './auth/auth.routes';
import { investmentRouter } from './investments/investment.routes';
import { AppDataSource } from './data-source';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'portfolio-api',
      database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
    });
  });

  app.get('/api/v1', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Portfolio Management Dashboard API' });
  });

  app.use('/api/auth', authRouter);

  app.use('/api/investments', investmentRouter);

  return app;
}