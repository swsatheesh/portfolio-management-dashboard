import rateLimit from 'express-rate-limit';
import { appConfig } from '../config/auth.config';

interface LoginRateLimiterOptions {
  windowMs?: number;
  max?: number;
}

export function createLoginRateLimiter(options: LoginRateLimiterOptions = {}) {
  return rateLimit({
    windowMs: options.windowMs ?? appConfig.authRateLimit.windowMs,
    limit: options.max ?? appConfig.authRateLimit.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_req, res) => {
      return res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message:
            'Too many failed login attempts. Please try again later.',
        },
      });
    },
  });
}

export const loginRateLimiter = createLoginRateLimiter();