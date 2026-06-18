import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * ESLint flat config (ESLint 9 + Next.js 16).
 *
 * Next 16 removed the `next lint` command, so we run ESLint directly
 * (`eslint .`). `eslint-config-next` v16 ships flat configs, so we spread its
 * `core-web-vitals` config rather than bridging it with FlatCompat.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "tests/e2e/**",
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      "@next/next/no-img-element": "off",
      // New React-Compiler rule in Next 16's config. The codebase uses standard,
      // safe patterns it flags (next-themes mount guard, useEffect data loaders
      // toggling a loading flag), so keep it visible as a warning rather than a
      // hard error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
