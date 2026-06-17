import { openApiSpec } from '../src/docs/openapi';

describe('openApiSpec', () => {
  it('creates OpenAPI specification', () => {
    expect(openApiSpec).toMatchObject({
      openapi: '3.0.0',
      info: {
        title: 'Portfolio Management Dashboard API',
        version: '1.0.0',
      },
    });
  });

  it('includes bearer auth security scheme', () => {
    expect(openApiSpec.components?.securitySchemes).toHaveProperty(
      'bearerAuth'
    );
  });

  it('contains auth endpoints', () => {
    expect(openApiSpec.paths).toHaveProperty('/api/auth/login');
    expect(openApiSpec.paths).toHaveProperty('/api/auth/profile');
  });

  it('contains investment endpoints', () => {
    expect(openApiSpec.paths).toHaveProperty('/api/investments');
    expect(openApiSpec.paths).toHaveProperty('/api/investments/{id}');
  });

  it('contains transaction endpoints', () => {
    expect(openApiSpec.paths).toHaveProperty('/api/transactions');
    expect(openApiSpec.paths).toHaveProperty('/api/transactions/{id}');
  });

  it('contains portfolio endpoints', () => {
    expect(openApiSpec.paths).toHaveProperty('/api/portfolio/summary');
  });
});