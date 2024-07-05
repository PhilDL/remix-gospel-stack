/// <reference types="./types.d.ts" />

import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

import base from "./base.js";

export default [
  ...base,
  {
    // jsx-runtime
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
    },
  },
  {
    ignores: ["**/*.spec.ts"],
    files: ["**/*.ts?(x)", "**/*.js?(x)"],
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
    },
  },
];
