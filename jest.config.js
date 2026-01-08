/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                strict: false,
                noImplicitAny: false,
            }
        }],
        '^.+\\.jsx?$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: ['**/*.test.ts', '**/*.test.js'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
    ],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 95,
            lines: 95,
            statements: 95,
        },
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: [],
    verbose: true,
}
