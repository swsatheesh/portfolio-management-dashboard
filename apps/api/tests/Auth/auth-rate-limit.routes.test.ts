import express from 'express';
import request from 'supertest';
import { createLoginRateLimiter } from '../../src/auth/auth-rate-limit.middleware';

describe('loginRateLimiter', () => {
  function createTestApp() {
    const app = express();

    app.use(express.json());

    app.post(
      '/api/auth/login',
      createLoginRateLimiter({
        windowMs: 60_000,
        max: 2,
      }),
      (_req, res) => {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          },
        });
      }
    );

    return app;
  }

  it('returns 429 after the allowed failed attempts', async () => {
    const app = createTestApp();

    const firstResponse = await request(app)
      .post('/api/auth/login')
      .send({});

    const secondResponse = await request(app)
      .post('/api/auth/login')
      .send({});

    const thirdResponse = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(firstResponse.status).toBe(401);
    expect(secondResponse.status).toBe(401);
    expect(thirdResponse.status).toBe(429);

    expect(thirdResponse.body).toEqual({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message:
          'Too many failed login attempts. Please try again later.',
      },
    });
  });

  it('does not count successful requests as failed attempts', async () => {
    const app = express();

    app.use(express.json());

    let attempt = 0;

    app.post(
      '/api/auth/login',
      createLoginRateLimiter({
        windowMs: 60_000,
        max: 1,
      }),
      (_req, res) => {
        attempt += 1;

        if (attempt === 1) {
          return res.status(200).json({
            accessToken: 'token',
          });
        }

        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          },
        });
      }
    );

    const successfulResponse = await request(app)
      .post('/api/auth/login')
      .send({});

    const failedResponse = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(successfulResponse.status).toBe(200);
    expect(failedResponse.status).toBe(401);
  });
});