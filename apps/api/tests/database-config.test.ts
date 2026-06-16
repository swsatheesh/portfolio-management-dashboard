import { getDatabaseConfig } from '../src/config/database.config';

describe('getDatabaseConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses SQLite for development', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_PATH = '/app/data/test.sqlite';

    const config = getDatabaseConfig();

    expect(config.type).toBe('sqlite');
    expect(config).toMatchObject({
      database: '/app/data/test.sqlite',
      synchronize: true,
    });
  });

  it('uses PostgreSQL for production', () => {
    process.env.NODE_ENV = 'production';
    process.env.POSTGRES_HOST = 'postgres';
    process.env.POSTGRES_DB = 'portfolio_db';

    const config = getDatabaseConfig();

    expect(config.type).toBe('postgres');
    expect(config).toMatchObject({
      host: 'postgres',
      database: 'portfolio_db',
      synchronize: false,
    });
  });
});