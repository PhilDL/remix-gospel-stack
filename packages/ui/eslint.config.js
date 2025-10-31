// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import reactRouterConfig from "@react-router-gospel-stack/eslint-config/react-router";
import storybook from "eslint-plugin-storybook";

/** @type {import('typescript-eslint').Config} */
export default [...reactRouterConfig, ...storybook.configs["flat/recommended"]];
