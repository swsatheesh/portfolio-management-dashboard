import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'portfolio-api' });
  });

  app.get('/api/v1', (_req, res) => {
    res.status(200).json({ message: 'Portfolio Management Dashboard API' });
  });

  return app;
}
