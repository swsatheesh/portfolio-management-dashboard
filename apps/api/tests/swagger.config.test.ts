import { swaggerSpec } from '../src/config/swagger.config';

describe('swaggerSpec', () => {
  it('creates OpenAPI specification', () => {
    expect(swaggerSpec).toMatchObject({
      openapi: '3.0.0',
      info: {
        title: 'Portfolio Management Dashboard API',
        version: '1.0.0',
      },
    });
  });

  it('includes bearer auth security scheme', () => {
    expect(swaggerSpec.components?.securitySchemes).toHaveProperty(
      'bearerAuth'
    );
  });
});