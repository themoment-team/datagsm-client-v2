import { nextJsConfig } from '@datagsm/eslint-config/next-js';

export default [
  ...nextJsConfig,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-location-assign-relative-destination': 'off',
    },
  },
];
