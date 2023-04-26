module.exports = {
  extends: ["turbo", "prettier", "plugin:tailwindcss/recommended"],
  plugins: ["tailwindcss"],
  rules: {
    "tailwindcss/no-custom-classname": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
