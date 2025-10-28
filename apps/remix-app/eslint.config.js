import remixConfig from "@remix-gospel-stack/eslint-config/remix";

/** @type {import('typescript-eslint').Config} */
export default [
  ...remixConfig,
  {
    ignores: ["server-build/**"],
  },
];
