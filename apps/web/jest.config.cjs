module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  testMatch: ['<rootDir>/tests/**/*.test.tsx'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/styleMock.cjs'
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: {
          ignoreCodes: [1343]
        },
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta',
              options: { 
                metaObject: { 
                  env: { 
                    VITE_API_BASE_URL: 'http://localhost:3000'
                  } 
                } 
              }
            }
          ]
        }
      }
    ]
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,ts}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/server.ts',
  ],
  globals: {
    'import.meta': {
      env: {
        VITE_API_BASE_URL: 'http://localhost:3000'
      }
    }
  }
};
