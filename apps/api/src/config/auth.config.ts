import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'test' | 'production';
export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export function getAuthConfig(): AuthConfig {
  return {
    jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  };
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}


function getOptionalNumberEnv(name: string, defaultValue: number): number {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return parsedValue;
}

function getNodeEnv(): NodeEnv {
  const value = process.env.NODE_ENV ?? 'development';

  if (!['development', 'test', 'production'].includes(value)) {
    throw new Error(`Invalid NODE_ENV: ${value}`);
  }

  return value as NodeEnv;
}

export const appConfig = {
  nodeEnv: getNodeEnv(),
  port: getOptionalNumberEnv('API_PORT', 3000),
  jwtSecret:
    process.env.NODE_ENV === 'production'
      ? getRequiredEnv('JWT_SECRET')
      : process.env.JWT_SECRET ?? 'dev-only-jwt-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};