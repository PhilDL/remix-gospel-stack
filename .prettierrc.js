/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig*/
/** @typedef  {import("prettier").Config} PrettierConfig*/
/** @typedef  {{ tailwindConfig: string }} TailwindConfig*/

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
    printWidth: 80,
    tabWidth: 2,
    plugins: [
      "@ianvs/prettier-plugin-sort-imports",
    //   "prettier-plugin-tailwindcss",
    ],
    tailwindConfig: "./packages/config-packages/tailwind-config",
    importOrder: [
      "^(react/(.*)$)|^(react$)|^(react-native(.*)$)",
      "^(remix/(.*)$)|^(remix$)",
      "^(next/(.*)$)|^(next$)",
      "<THIRD_PARTY_MODULES>",
      "",
      "^@remix-gospel-stack/(.*)$",
      "",
      "^~/utils/(.*)$",
      "^~/components/(.*)$",
      "^~/(.*)$",
      "^[./]",
    ],
    importOrderSeparation: false,
    importOrderSortSpecifiers: true,
    importOrderBuiltinModulesToTop: true,
    importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
    importOrderMergeDuplicateImports: true,
    importOrderCombineTypeAndValueImports: true,
  };
  
  module.exports = config;
  