import type { Config } from "tailwindcss";

import { shadcnPreset } from "@remix-gospel-stack/ui/tailwind";

export default {
  content: [
    "src/**/*.{ts,tsx}",
    "./app/**/*.{ts,jsx,tsx}",
    "components/**/*.{ts,tsx}",
    "../../packages/**/*.{ts,tsx}",
  ],
  presets: [shadcnPreset],
} satisfies Config;
