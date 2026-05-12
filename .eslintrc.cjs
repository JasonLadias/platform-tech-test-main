module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    'backend/uploads',
    '.eslintrc.cjs',
    '**/*.config.ts',
    '**/*.config.js',
  ],
  overrides: [
    {
      files: ['backend/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './backend/tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      env: { node: true, browser: false },
      extends: [
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        'import/prefer-default-export': 'off',
        'import/extensions': ['error', 'ignorePackages', {
          ts: 'never',
          js: 'always',
        }],
        'no-underscore-dangle': ['error', { allow: ['__dirname', '__filename'] }],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            filter: { regex: '^__(dirname|filename)$', match: false },
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
    {
      files: ['frontend/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './frontend/tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      env: { browser: true, node: false },
      extends: [
        'airbnb',
        'airbnb/hooks',
        'airbnb-typescript',
        'plugin:@typescript-eslint/recommended',
      ],
      settings: {
        react: { version: 'detect' },
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/require-default-props': 'off',
        'import/prefer-default-export': 'off',
        'import/extensions': ['error', 'ignorePackages', {
          ts: 'never',
          tsx: 'never',
        }],
        'jsx-a11y/label-has-associated-control': [
          'error',
          { assert: 'either' },
        ],
      },
    },
  ],
};
