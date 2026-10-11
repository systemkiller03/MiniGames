import { defineConfig } from 'vitest/config';

export default defineConfig({
    base: '/MiniGames/',
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    test: {
        environment: 'node',
        globals: true,
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.d.ts', 'src/**/*.test.ts', 'src/**/*.spec.ts'],
        },
    },
});
