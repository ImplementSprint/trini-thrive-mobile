import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@digdon/ui$': '<rootDir>/packages/ui',
    '^@digdon/ui/(.*)$': '<rootDir>/packages/ui/$1',
    '^@digdon/mock-data$': '<rootDir>/packages/mock-data',
    '^@digdon/mock-data/(.*)$': '<rootDir>/packages/mock-data/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'constants/**/*.ts',
    'hooks/use-theme-color.ts',
    'packages/ui/tokens.ts',
    'packages/mock-data/campaigns.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'lcov', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      functions: 80,
      branches: 80,
    },
  },
};

export default config;
