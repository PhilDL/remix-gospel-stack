// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import remixConfig from "@remix-gospel-stack/eslint-config/remix";

/** @type {import('typescript-eslint').Config} */
export default [...remixConfig, ...storybook.configs["flat/recommended"]];
