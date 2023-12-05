import type { Meta } from "@storybook/react";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ["autodocs"],
};

export const Default = {
  args: {
    children: "hey",
  },
};

export default meta;
