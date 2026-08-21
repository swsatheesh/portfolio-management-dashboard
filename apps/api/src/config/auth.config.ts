import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'test' | 'production';

function getNumberEnv(name: string, defaultValue: number, minimum = 1): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(
      `${name} must be an integer greater than or equal to ${minimum}`
    );
  }

  return value;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getNodeEnv(): NodeEnv {
  const value = process.env.NODE_ENV ?? 'development';

  if (!['development', 'test', 'production'].includes(value)) {
    throw new Error(`Invalid NODE_ENV: ${value}`);
  }

  return value as NodeEnv;
}

const nodeEnv = getNodeEnv();
const isProduction = nodeEnv === 'production';

const jwtSecret = isProduction
  ? getRequiredEnv('JWT_SECRET')
  : process.env.JWT_SECRET ?? 'development-only-secret';

if (isProduction && jwtSecret.length < 32) {
  throw new Error(
    'JWT_SECRET must contain at least 32 characters in production'
  );
}

export const appConfig = {
  nodeEnv,
  isProduction,
  isTest: nodeEnv === 'test',
  port: getNumberEnv('API_PORT', 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  globalRateLimit: {
    windowMs: getNumberEnv('GLOBAL_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: getNumberEnv('GLOBAL_RATE_LIMIT_MAX', isProduction ? 100 : 1000),
  },
  authRateLimit: {
    windowMs: getNumberEnv('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: getNumberEnv('AUTH_RATE_LIMIT_MAX', isProduction ? 5 : 100),
  },
};