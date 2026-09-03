// ESLint 9 flat config. Next 16 removed the `next lint` command, and ESLint 9 no
// longer reads .eslintrc.json, so both the runner and the config format moved.
// eslint-config-next ships flat-config arrays directly, so no compat shim is needed.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];
