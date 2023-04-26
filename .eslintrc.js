module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `@remix-gospel-stack/eslint`
  extends: ["custom"],
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
