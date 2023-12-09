import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ["autodocs"],
};

export const Default = {
  args: {
    children: "Placeholder text",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Placeholder text",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Placeholder text",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Placeholder text",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Placeholder text",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Placeholder text",
  },
};
