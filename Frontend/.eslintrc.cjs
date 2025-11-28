module.exports = {
    env: { browser: true, es2021: true },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
    settings: { react: { version: 'detect' } },
    rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
};
