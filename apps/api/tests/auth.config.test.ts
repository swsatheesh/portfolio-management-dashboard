import { getAuthConfig } from '../src/config/auth.config';

describe('getAuthConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns JWT config from environment variables', () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '2h';

    const config = getAuthConfig();

    expect(config).toEqual({
      jwtSecret: 'test-secret',
      jwtExpiresIn: '2h',
    });
  });

  it('returns default JWT config when environment variables are missing', () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;

    const config = getAuthConfig();

    expect(config).toEqual({
      jwtSecret: 'development-only-secret',
      jwtExpiresIn: '1d',
    });
  });
});