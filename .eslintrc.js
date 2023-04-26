module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `@remix-gospel-stack/eslint-config`
  extends: ["@remix-gospel-stack/eslint-config"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
};
