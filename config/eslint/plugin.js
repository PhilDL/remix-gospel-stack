import throwRedirect from "./rules/throw-redirect.js";

export const meta = {
  name: "eslint-react-router",
};
export const configs = {
  recommended: {
    plugins: ["eslint-react-router"],
    rules: {
      "eslint-react-router/prefer-throw-redirect": "warn",
    },
  },
};

export const rules = {
  "prefer-throw-redirect": throwRedirect,
};

export default { configs, rules, meta };
