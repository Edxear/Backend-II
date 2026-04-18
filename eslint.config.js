export default [
    {
        files: ['src/**/*.js', 'public/js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        rules: {
            'no-unused-vars': 'off',
            'no-console': 'off',
        },
    },
    {
        ignores: ['node_modules/**', 'logs/**'],
    },
];
