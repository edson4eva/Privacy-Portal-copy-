import baseConfig from '../../eslint.config.mjs';

export default [
    {
        ignores: ['**/dist'],
    },
    ...baseConfig,
    {
        ignores: ['src/assets/tinymce/*', 'src/app/components/editing/RichTextEditor.tsx'],
    },
];
