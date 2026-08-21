describe('AuthConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns JWT config from environment variables', () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '2h';

    const { appConfig } = require('../src/config/auth.config');

    expect(appConfig.jwtSecret).toBe('test-secret');
    expect(appConfig.jwtExpiresIn).toBe('2h');
  });

  it('returns default JWT config when environment variables are missing', () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;

    const { appConfig } = require('../src/config/auth.config');

    expect(appConfig.jwtSecret).toBe('development-only-secret');
    expect(appConfig.jwtExpiresIn).toBe('15m');
  });
});