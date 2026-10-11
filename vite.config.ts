import { defineConfig } from 'vitest/config';

export default defineConfig({
    base: '/MiniGames/',
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        passWithNoTests: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            all: true,
            include: ['src/**/*.ts'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.test.ts',
                'src/**/*.spec.ts',
                'src/pages/**/*.ts',
                'src/app/**/*.ts',
                'src/main.ts',
                'src/features/**/components/**/*.ts',
                'src/features/**/index.ts',
                'src/features/**/styles/**/*.ts',
                'src/shared/components/**/*.ts',
            ],
        },
    },
});
