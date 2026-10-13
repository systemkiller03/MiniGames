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
        setupFiles: ['src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            all: true,
            skipFull: false,
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                // Declaration files contain types only.
                'src/**/*.d.ts',
                // Test files are not application logic.
                'src/**/*.test.{ts,tsx}',
                // Test files are not application logic.
                'src/**/*.spec.{ts,tsx}',
                // This configures the test environment and contains no app behavior.
                'src/test/setup.ts',
                // The entry point only wires startup; runtime behavior lives in modules.
                'src/main.ts',
                // This file contains only TypeScript types.
                'src/features/library-game-grid/components/types.ts',
                // This file contains only a static placeholder constant.
                'src/features/index.ts',
            ],
        },
    },
});
