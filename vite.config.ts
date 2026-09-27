import { defineConfig } from 'vite';

export default defineConfig({
    base: '/MiniGames/',
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
