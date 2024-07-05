import baseConfig from "@remix-gospel-stack/eslint-config/base.js";
import nextConfig from "@remix-gospel-stack/eslint-config/next.js";

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  ...nextConfig,
  {
    ignores: [".next/**"],
  },
];
