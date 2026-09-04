import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import nxEslintPlugin from '@nx/eslint-plugin';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

const compat = new FlatCompat({
    baseDirectory: dirname(fileURLToPath(import.meta.url)),
    recommendedConfig: js.configs.recommended,
});

export default [
    {
        ignores: ['**/dist'],
    },
    {
        plugins: {
            '@nx': nxEslintPlugin,
            react: eslintPluginReact,
            'react-hooks': eslintPluginReactHooks,
            unicorn: eslintPluginUnicorn,
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: [],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
        },
    },
    ...compat
        .config({
            extends: ['plugin:@nx/typescript'],
        })
        .map((config) => ({
            ...config,
            files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
            rules: {
                ...config.rules,
                '@typescript-eslint/no-var-requires': [
                    'error',
                    {
                        allow: ['/environment\\.*'],
                    },
                ],
                '@typescript-eslint/no-empty-function': [
                    'error',
                    {
                        allow: ['functions', 'arrowFunctions', 'methods'],
                    },
                ],
            },
        })),
    ...compat
        .config({
            extends: ['plugin:@nx/javascript'],
        })
        .map((config) => ({
            ...config,
            files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
            rules: {
                ...config.rules,
                'no-unused-vars': 'error',
            },
        })),
    ...compat
        .config({
            env: {
                jest: true,
            },
        })
        .map((config) => ({
            ...config,
            files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
            rules: {
                ...config.rules,
            },
        })),
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            'prefer-const': [
                'error',
                {
                    ignoreReadBeforeAssign: true,
                },
            ],
            eqeqeq: ['error', 'always'],
            'require-await': 'error',
            strict: 'error',
            'no-console': [
                'error',
                {
                    allow: ['warn', 'error'],
                },
            ],
            camelcase: [
                'error',
                {
                    properties: 'always',
                },
            ],
            'react/jsx-uses-vars': 'error',
            'react/jsx-props-no-spreading': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'unicorn/prevent-abbreviations': 'error',
            'unicorn/filename-case': [
                'error',
                {
                    cases: {
                        camelCase: true,
                        pascalCase: true,
                        kebabCase: true,
                    },
                },
            ],
        },
    },
    {
        ignores: ['node_modules\r'],
    },
];
