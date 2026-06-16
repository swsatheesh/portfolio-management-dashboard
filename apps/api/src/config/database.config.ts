import { DataSourceOptions } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { InvestmentEntity } from '../entities/investment.entity';
import { TransactionEntity } from '../entities/transaction.entity';


export function getDatabaseConfig(): DataSourceOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    return {
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'postgres',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'portfolio_user',
      password: process.env.POSTGRES_PASSWORD ?? 'portfolio_password',
      database: process.env.POSTGRES_DB ?? 'portfolio_db',
      entities: [UserEntity, InvestmentEntity, TransactionEntity],
      migrations: ['dist/migrations/*.js'],
      synchronize: false,
    };
  }

  return {
    type: 'sqlite',
    database: process.env.DATABASE_PATH ?? '/app/data/dev.sqlite',
    entities: [UserEntity, InvestmentEntity, TransactionEntity],
    migrations: ['src/migrations/*.ts'],
    synchronize: true,
  };
}