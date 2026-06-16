import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Management Dashboard API',
      version: '1.0.0',
      description:
        'REST API for authentication, investments, transactions and portfolio summary.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Docker development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['src/**/*.routes.ts'],
});