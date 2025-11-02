# UI Package Guide

The `ui` package is a React component library built with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS. It provides pre-built, accessible components that can be used across applications in the monorepo.

## Overview

**Location:** `packages/ui/`

**Features:**
- 🎨 Built with [shadcn/ui](https://ui.shadcn.com/)
- ♿ Accessible components (built on Radix UI)
- 🎯 Tailwind CSS integration
- 📦 Bundled and distributable
- 🔧 Customizable via Tailwind config
- 📱 Responsive by default

## Package Structure

```
packages/ui/
├── src/
│   ├── components/          # React components
│   │   ├── button.tsx       # Button component
│   │   ├── card.tsx         # Card component
│   │   └── index.ts         # Component exports
│   ├── tailwind/            # Tailwind configuration
│   │   └── theme.css        # Theme styles
│   ├── utils/               # Utility functions
│   │   └── cn.ts            # Class name utility
│   ├── index.ts             # Main exports
│   └── main.tsx             # Dev preview entry
├── components.json          # shadcn/ui configuration
├── package.json
├── tsconfig.json
├── tsup.config.ts           # Build configuration
└── vite.config.ts           # Dev server configuration
```

## Using the UI Package

### Installing in Your App

The webapp already has the UI package installed. For new apps:

```bash
pnpm add @react-router-gospel-stack/ui --filter=@react-router-gospel-stack/your-app
```

### Importing Components

```typescript
import { Button, Card, CardHeader, CardContent } from "@react-router-gospel-stack/ui";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <h2>Welcome</h2>
      </CardHeader>
      <CardContent>
        <p>This is a card component</p>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Available Components

The package includes common shadcn/ui components:

- **Button** - Interactive button with variants
- **Card** - Container for content with header/footer
- More components can be added as needed

See the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for component APIs.

## Adding New Components

### Using shadcn/ui CLI

The easiest way to add new components:

```bash
cd packages/ui
pnpm dlx shadcn-ui@latest add <component-name>
```

Example:
```bash
cd packages/ui
pnpm dlx shadcn-ui@latest add dialog
```

This will:
1. Download the component source
2. Add it to `src/components/`
3. Install any required dependencies
4. Update the component registry

### Manual Addition

If you prefer to add components manually:

1. **Create the component file:**
   ```typescript
   // src/components/my-component.tsx
   import * as React from "react";
   import { cn } from "../utils/cn";
   
   export interface MyComponentProps
     extends React.HTMLAttributes<HTMLDivElement> {
     variant?: "default" | "outline";
   }
   
   export const MyComponent = React.forwardRef<
     HTMLDivElement,
     MyComponentProps
   >(({ className, variant = "default", ...props }, ref) => {
     return (
       <div
         ref={ref}
         className={cn(
           "base-styles",
           variant === "outline" && "outline-styles",
           className
         )}
         {...props}
       />
     );
   });
   
   MyComponent.displayName = "MyComponent";
   ```

2. **Export from components index:**
   ```typescript
   // src/components/index.ts
   export * from "./my-component";
   ```

3. **Export from package root:**
   ```typescript
   // src/index.ts
   export * from "./components";
   ```

4. **Rebuild the package:**
   ```bash
   pnpm run build --filter=@react-router-gospel-stack/ui
   ```

## Tailwind CSS Integration

### Using the Theme in Your App

The UI package exports a Tailwind preset that includes the theme configuration.

**In your app's `tailwind.config.ts`:**

```typescript
import type { Config } from "tailwindcss";
import uiPreset from "@react-router-gospel-stack/ui/tailwind";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    // Include UI package components
    "./node_modules/@react-router-gospel-stack/ui/dist/**/*.js",
  ],
  presets: [uiPreset],
  theme: {
    extend: {
      // Your custom theme extensions
    },
  },
} satisfies Config;
```

### Customizing the Theme

To customize the theme, edit the CSS variables in `src/tailwind/theme.css`:

```css
@layer base {
  :root {
    /* Update these values to customize your theme */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }

  .dark {
    /* Dark mode variables */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```

These CSS variables are used by the components for theming.

### Class Name Utility

The `cn` utility combines class names and handles Tailwind conflicts:

```typescript
import { cn } from "@react-router-gospel-stack/ui";

// Merge classes with proper precedence
const className = cn(
  "base-styles",
  isActive && "active-styles",
  "override-styles"
);
```

It uses [clsx](https://github.com/lukeed/clsx) and [tailwind-merge](https://github.com/dcastil/tailwind-merge) under the hood.

## Development Workflow

### Running the Dev Server

The UI package includes a Vite dev server for developing components in isolation:

```bash
pnpm run dev --filter=@react-router-gospel-stack/ui
```

This starts a dev server at `http://localhost:5173` (or next available port) where you can preview components.

**Edit `src/app.tsx` to preview your components:**

```typescript
import { Button, Card } from "./components";

export function App() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">UI Component Preview</h1>
      
      <Card>
        <h2>Buttons</h2>
        <div className="flex gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>
    </div>
  );
}
```

### Building the Package

```bash
pnpm run build --filter=@react-router-gospel-stack/ui
```

This uses tsup to:
1. Bundle TypeScript to JavaScript
2. Generate type definitions
3. Output to `dist/`

### Build Configuration

The build is configured in `tsup.config.ts`:

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    components: "src/components/index.ts",
    tailwind: "src/tailwind/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
});
```

This creates:
- `dist/index.js` - Main entry point
- `dist/components/` - Component exports
- `dist/tailwind/` - Tailwind config exports
- Type definitions for all exports

## Component Best Practices

### Accessibility

shadcn/ui components are built on [Radix UI](https://www.radix-ui.com/), which provides excellent accessibility out of the box:

- Keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes

**Always maintain these features when customizing:**

```typescript
// ✅ Good - preserves accessibility
<Button onClick={handleClick} aria-label="Close dialog">
  Close
</Button>

// ❌ Bad - removes accessibility features
<div onClick={handleClick}>Close</div>
```

### Variants with CVA

For components with multiple variants, consider using [class-variance-authority](https://cva.style/docs):

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
```

### TypeScript Types

Always export component prop types:

```typescript
export interface MyComponentProps {
  title: string;
  description?: string;
  onClose?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ ... }) => {
  // ...
};
```

This allows consumers to:
```typescript
import type { MyComponentProps } from "@react-router-gospel-stack/ui";

// Use the type in their code
const props: MyComponentProps = { ... };
```

### Forwarding Refs

Use `React.forwardRef` for components that need ref access:

```typescript
export const MyComponent = React.forwardRef<
  HTMLDivElement,
  MyComponentProps
>((props, ref) => {
  return <div ref={ref} {...props} />;
});

MyComponent.displayName = "MyComponent";
```

## Styling Guidelines

### Use Tailwind Classes

Prefer Tailwind utility classes over custom CSS:

```typescript
// ✅ Good
<div className="flex items-center gap-4 p-4 rounded-lg bg-white">

// ❌ Avoid
<div style={{ display: 'flex', alignItems: 'center', ... }}>
```

### Responsive Design

Use Tailwind's responsive prefixes:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Dark Mode

Use Tailwind's dark mode classes:

```typescript
<div className="bg-white dark:bg-slate-900 text-black dark:text-white">
  {/* Supports dark mode */}
</div>
```

Dark mode is configured in `tailwind.config.ts`:

```typescript
export default {
  darkMode: ["class"],  // Uses class-based dark mode
  // ...
}
```

Toggle dark mode by adding/removing the `dark` class on the root element.

## Testing Components

### Unit Tests

Write unit tests using Vitest and Testing Library:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Visual Testing

For visual regression testing, consider:
- [Storybook](https://storybook.js.org/) - Component development and documentation
- [Chromatic](https://www.chromatic.com/) - Visual testing and review

## Publishing the Package

If you want to publish the UI package to npm:

1. **Update package.json:**
   ```json
   {
     "name": "@your-org/ui",
     "version": "1.0.0",
     "publishConfig": {
       "access": "public"
     }
   }
   ```

2. **Build the package:**
   ```bash
   pnpm run build --filter=@react-router-gospel-stack/ui
   ```

3. **Publish:**
   ```bash
   cd packages/ui
   npm publish
   ```

## Migrating from shadcn/ui Updates

When shadcn/ui releases updates:

1. **Update the CLI:**
   ```bash
   pnpm dlx shadcn-ui@latest
   ```

2. **Check for component updates:**
   ```bash
   cd packages/ui
   pnpm dlx shadcn-ui@latest diff
   ```

3. **Update individual components:**
   ```bash
   pnpm dlx shadcn-ui@latest add <component-name> --overwrite
   ```

4. **Test thoroughly** - Updates may include breaking changes

## Troubleshooting

### Tailwind Classes Not Working

If Tailwind classes aren't being applied:

1. Verify the content paths in your app's `tailwind.config.ts`
2. Ensure the UI package is built: `pnpm run build --filter=ui`
3. Restart your dev server

### Type Errors After Adding Components

If you see type errors:

```bash
# Rebuild the UI package
pnpm run build --filter=@react-router-gospel-stack/ui

# Rebuild consuming apps
pnpm run build --filter=@react-router-gospel-stack/webapp...
```

### Components Not Found

If imports aren't working:

1. Check the component is exported in `src/components/index.ts`
2. Check it's re-exported in `src/index.ts`
3. Rebuild: `pnpm run build --filter=ui`

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Next Steps

- Browse [shadcn/ui components](https://ui.shadcn.com/docs/components) to add more
- Customize the theme in `src/tailwind/theme.css`
- Build your own custom components using the patterns shown
- Check the [Architecture Guide](./architecture.md) to understand how packages fit together

