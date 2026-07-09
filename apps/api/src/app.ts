import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { appConfig } from './config/auth.config';
import { authRouter } from './auth/auth.routes';
import { AppDataSource } from './data-source';
import { investmentRouter } from './investments/investment.routes';
import { transactionRouter } from './transactions/transaction.routes';
import { portfolioRouter } from './portfolio/portfolio.routes';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs/openapi';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: appConfig.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  if (!appConfig.isTest) {
    app.use(morgan(appConfig.isProduction ? 'combined' : 'dev'));
  }

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: appConfig.isProduction ? 100 : 1000,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

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
  app.use('/api/transactions', transactionRouter);
  app.use('/api/portfolio', portfolioRouter);

  return app;
}