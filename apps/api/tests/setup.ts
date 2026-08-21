process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  'test-secret-that-is-long-enough-for-testing';
process.env.JWT_EXPIRES_IN = '15m';

process.env.AUTH_RATE_LIMIT_WINDOW_MS = '60000';
process.env.AUTH_RATE_LIMIT_MAX = '2';

process.env.GLOBAL_RATE_LIMIT_WINDOW_MS = '60000';
process.env.GLOBAL_RATE_LIMIT_MAX = '1000';