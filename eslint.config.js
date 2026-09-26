import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**'],
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        plugins: {
            unicorn,
        },

        rules: {
            ...unicorn.configs.recommended.rules,

            '@typescript-eslint/no-explicit-any': 'error',
            'space-before-blocks': ['error', 'never'],
            'keyword-spacing': ['error', { after: false }],
            'space-before-function-paren': ['error', 'never'],
        },

        linterOptions: {
            noInlineConfig: true,
        },
    },
);
