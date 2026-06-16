export const openApiSpec = {
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
  tags: [
    { name: 'Auth' },
    { name: 'Investments' },
    { name: 'Transactions' },
    { name: 'Portfolio' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@test.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      InvestmentInput: {
        type: 'object',
        required: [
          'name',
          'symbol',
          'assetType',
          'quantity',
          'purchasePrice',
          'currentPrice',
        ],
        properties: {
          name: { type: 'string', example: 'Apple Inc.' },
          symbol: { type: 'string', example: 'AAPL' },
          assetType: {
            type: 'string',
            enum: ['STOCK', 'BOND', 'MUTUAL_FUND', 'ETF', 'CASH'],
            example: 'STOCK',
          },
          quantity: { type: 'number', example: 10 },
          purchasePrice: { type: 'number', example: 150 },
          currentPrice: { type: 'number', example: 200 },
        },
      },
      TransactionInput: {
        type: 'object',
        required: ['investmentId', 'type', 'quantity', 'price', 'transactionDate'],
        properties: {
          investmentId: { type: 'string' },
          type: { type: 'string', enum: ['BUY', 'SELL'], example: 'BUY' },
          quantity: { type: 'number', example: 10 },
          price: { type: 'number', example: 150 },
          transactionDate: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-16T00:00:00.000Z',
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: { description: 'API health status' },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          400: { description: 'Email and password are required' },
          401: { description: 'Invalid email or password' },
        },
      },
    },

    '/api/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get authenticated profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated user profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },

    '/api/investments': {
      get: {
        tags: ['Investments'],
        summary: 'List investments',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Investment list' },
        },
      },
      post: {
        tags: ['Investments'],
        summary: 'Create investment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InvestmentInput' },
            },
          },
        },
        responses: {
          201: { description: 'Investment created' },
          401: { description: 'Unauthorized' },
        },
      },
    },

    '/api/investments/{id}': {
      get: {
        tags: ['Investments'],
        summary: 'Get investment by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Investment found' },
          404: { description: 'Investment not found' },
        },
      },
      patch: {
        tags: ['Investments'],
        summary: 'Update investment',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InvestmentInput' },
            },
          },
        },
        responses: {
          200: { description: 'Investment updated' },
          404: { description: 'Investment not found' },
        },
      },
      delete: {
        tags: ['Investments'],
        summary: 'Delete investment',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Investment deleted' },
          404: { description: 'Investment not found' },
        },
      },
    },

    '/api/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List transactions',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Transaction list' },
        },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Create transaction',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TransactionInput' },
            },
          },
        },
        responses: {
          201: { description: 'Transaction created' },
          404: { description: 'Investment not found' },
        },
      },
    },

    '/api/transactions/{id}': {
      get: {
        tags: ['Transactions'],
        summary: 'Get transaction by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Transaction found' },
          404: { description: 'Transaction not found' },
        },
      },
      patch: {
        tags: ['Transactions'],
        summary: 'Update transaction',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TransactionInput' },
            },
          },
        },
        responses: {
          200: { description: 'Transaction updated' },
          404: { description: 'Transaction not found' },
        },
      },
      delete: {
        tags: ['Transactions'],
        summary: 'Delete transaction',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Transaction deleted' },
          404: { description: 'Transaction not found' },
        },
      },
    },

    '/api/portfolio/summary': {
      get: {
        tags: ['Portfolio'],
        summary: 'Get portfolio summary',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Portfolio summary and performance metrics' },
        },
      },
    },
  },
};