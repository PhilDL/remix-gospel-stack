// Setup heavily inspired by https://github.com/juliusmarminge/acme-corp
import { readFile, writeFile } from "fs/promises";
import { defineConfig, type Options } from "tsup";

const client = [
  "./src/checkbox.tsx",
  // "./src/calendar.tsx",
  // "./src/command.tsx",
  // "./src/dialog.tsx",
  // "./src/dropdown-menu.tsx",
  // "./src/input.tsx",
  // "./src/label.tsx",
  // "./src/popover.tsx",
  // "./src/scroll-area.tsx",
  // "./src/select.tsx",
  // "./src/sheet.tsx",
  // "./src/tabs.tsx",
  // "./src/toaster.tsx",
  // "./src/use-toast.tsx",
];

const server = [
  "./src/button.tsx",
  // "./src/icons.tsx",
  "./src/card.tsx",
  // "./src/toast.tsx",
];

export default defineConfig((opts) => {
  const common = {
    clean: !opts.watch,
    dts: true,
    format: ["esm"],
    minify: true,
    outDir: "dist",
  } satisfies Options;

  return [
    {
      // separate not to inject the banner
      ...common,
      entry: ["./src/index.ts", "./src/tailwind/index.ts", ...server],
    },
    {
      ...common,
      entry: client,
      esbuildOptions: (opts) => {
        opts.banner = {
          js: '"use client";',
        };
      },
      async onSuccess() {
        const pkgJson = JSON.parse(
          await readFile("./package.json", {
            encoding: "utf-8",
          })
        ) as PackageJson;
        pkgJson.exports = {
          "./package.json": "./package.json",
          ".": {
            import: "./src/index.ts",
            types: "./src/index.ts",
            default: "./dist/index.mjs",
          },
          "./tailwind": {
            import: "./src/tailwind/index.ts",
            types: "./src/tailwind/index.ts",
            default: "./dist/tailwind/index.mjs",
          },
        };
        [...client, ...server]
          .filter((e) => e.endsWith(".tsx"))
          .forEach((entry) => {
            const file = entry.replace("./src/", "").replace(".tsx", "");
            pkgJson.exports["./" + file] = {
              import: "./src/" + file + ".tsx",
              types: "./src/" + file + ".tsx",
            };
            pkgJson.typesVersions["*"][file] = ["src/" + file + ".tsx"];
          });

        await writeFile("./package.json", JSON.stringify(pkgJson, null, 2));
      },
    },
  ];
});

type PackageJson = {
  name: string;
  exports: Record<
    string,
    { import: string; types: string; default?: string } | string
  >;
  typesVersions: Record<"*", Record<string, string[]>>;
  files: string[];
  dependencies: Record<string, string>;
  pnpm: {
    overrides: Record<string, string>;
  };
};
