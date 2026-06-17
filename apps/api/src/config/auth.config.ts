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