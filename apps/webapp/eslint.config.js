import reactRouterConfig from "@react-router-gospel-stack/eslint-config/react-router";

/** @type {import('typescript-eslint').Config} */
export default [
  ...reactRouterConfig,
  {
    ignores: ["server-build/**"],
  },
];
