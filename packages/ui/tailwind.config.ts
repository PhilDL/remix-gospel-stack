import type { Config } from "tailwindcss";

import { shadcnPreset } from "./src/tailwind/shadcn-preset";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [shadcnPreset],
} satisfies Config;
