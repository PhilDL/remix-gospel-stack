# Testing Guide

This guide covers testing, linting, and type checking across the React Router Gospel Stack monorepo.

> **⚠️ Important:** All commands should be run from the **monorepo root directory** unless specified otherwise.

## Overview

The stack includes comprehensive testing and quality assurance tools:

- **[Vitest](https://vitest.dev)** - Fast unit testing framework
- **[Playwright](https://playwright.dev)** - End-to-end testing
- **[Testing Library](https://testing-library.com)** - React component testing utilities
- **[ESLint](https://eslint.org)** - Code linting
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking
- **[Prettier](https://prettier.io)** - Code formatting

## Unit Testing with Vitest

### Running Unit Tests

```bash
# Run all unit tests in the monorepo
pnpm run test

# Run tests in watch mode
pnpm run test:dev

# Run tests for a specific package
pnpm run test --filter=@react-router-gospel-stack/internal-nobuild

# Run tests with coverage
pnpm run test -- --coverage
```

### Writing Unit Tests

#### Basic Test Structure

```typescript
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("MyFunction", () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it("should return the correct value", () => {
    const result = myFunction(42);
    expect(result).toBe(84);
  });

  it("should handle edge cases", () => {
    expect(myFunction(0)).toBe(0);
    expect(() => myFunction(-1)).toThrow();
  });
});
```

#### Testing React Components

```typescript
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "./my-component";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent onClick={handleClick} />);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("updates after async operation", async () => {
    render(<MyComponent />);

    await waitFor(() => {
      expect(screen.getByText("Loaded")).toBeInTheDocument();
    });
  });
});
```

#### Mocking

```typescript
import { vi } from "vitest";

// Mock a function
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue("async result");

// Mock a module
vi.mock("./module", () => ({
  myFunction: vi.fn(() => "mocked"),
}));

// Spy on a function
const spy = vi.spyOn(object, "method");
```

### Test Configuration

Tests are configured per package in their `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // or "node" for server-side tests
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

### Example Packages with Tests

- **`internal-nobuild`** - Unit tests for TypeScript utilities
- **`webapp`** - React component tests with Testing Library

## End-to-End Testing with Playwright

### Running E2E Tests

```bash
# Run E2E tests (webapp must be running)
pnpm run test:e2e --filter=@react-router-gospel-stack/webapp

# Run E2E tests in dev mode (starts dev server)
pnpm run test:e2e:dev --filter=@react-router-gospel-stack/webapp

# Run E2E tests in headed mode (see browser)
pnpm run test:e2e:dev --filter=@react-router-gospel-stack/webapp -- --headed

# Run specific test file
pnpm run test:e2e:dev --filter=webapp -- tests/e2e/app.spec.ts
```

### Writing E2E Tests

#### Basic Test Structure

```typescript
import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/React Router Gospel Stack/);
  });

  test("should navigate to about page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/.*about/);
  });
});
```

#### Testing Forms

```typescript
test("should submit form", async ({ page }) => {
  await page.goto("/signup");

  // Fill in the form
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password123");

  // Submit
  await page.click('button[type="submit"]');

  // Wait for navigation or success message
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator(".success-message")).toBeVisible();
});
```

#### Testing API Calls

```typescript
test("should load data from API", async ({ page }) => {
  // Intercept API calls
  await page.route("**/api/users", (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: 1, name: "John Doe" }]),
    });
  });

  await page.goto("/users");
  await expect(page.locator(".user-name")).toHaveText("John Doe");
});
```

#### Testing Authentication

```typescript
import { test as base } from "@playwright/test";

// Extend base test with authentication
const test = base.extend({
  page: async ({ page }, use) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await use(page);
  },
});

test("authenticated user can access dashboard", async ({ page }) => {
  // Page is already authenticated
  await expect(page.locator(".dashboard")).toBeVisible();
});
```

### Playwright Configuration

E2E tests are configured in `apps/webapp/playwright.config.ts`:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Utilities

The webapp includes test utilities in `tests/`:

- **`db-utils.ts`** - Database helpers for testing
- **`playwright-utils.ts`** - Common Playwright utilities
- **`mocks/`** - Mock data and handlers

## Linting with ESLint

### Running the Linter

```bash
# Lint all files in the monorepo
pnpm run lint

# Lint specific package
pnpm run lint --filter=@react-router-gospel-stack/webapp

# Auto-fix issues
pnpm run lint -- --fix
```

### ESLint Configuration

ESLint configurations are in the `config/eslint` package:

```javascript
// Base configuration
import baseConfig from "@react-router-gospel-stack/eslint-config/base";

export default [
  ...baseConfig,
  {
    rules: {
      // Your custom rules
    },
  },
];
```

### Custom ESLint Rules

The stack includes custom ESLint rules in `config/eslint/rules/`:

- **`throw-redirect.js`** - Ensures redirects are properly thrown in React Router

### Disabling Rules

When you need to disable a rule:

```typescript
// Disable for a single line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = await fetchData();

// Disable for a block
/* eslint-disable @typescript-eslint/no-explicit-any */
const data: any = await fetchData();
const result: any = processData(data);
/* eslint-enable @typescript-eslint/no-explicit-any */

// Disable for entire file (use sparingly!)
/* eslint-disable @typescript-eslint/no-explicit-any */
```

## Type Checking with TypeScript

### Running Type Checks

```bash
# Type check entire monorepo
pnpm run typecheck

# Type check specific package
pnpm run typecheck --filter=@react-router-gospel-stack/webapp

# Watch mode (checks on file changes)
pnpm run typecheck --filter=webapp -- --watch
```

### TypeScript Configuration

TypeScript configs are in the `config/tsconfig` package:

```json
{
  "extends": "@react-router-gospel-stack/tsconfig/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    }
  },
  "include": ["app/**/*", "server/**/*"],
  "exclude": ["node_modules"]
}
```

### Common Type Issues

#### Prisma Types

If Prisma types are missing:

```bash
pnpm run db:generate
```

#### Module Not Found

If TypeScript can't find a module:

1. Ensure the package is built: `pnpm run build --filter=<package>`
2. Check `tsconfig.json` paths configuration
3. Restart your editor's TypeScript server

#### Strict Mode Issues

The stack uses TypeScript strict mode. Common issues:

```typescript
// ❌ Error: Object is possibly 'null'
const name = user.name.toUpperCase();

// ✅ Use optional chaining
const name = user?.name?.toUpperCase();

// ✅ Or type guard
if (user && user.name) {
  const name = user.name.toUpperCase();
}

// ❌ Error: Parameter 'x' implicitly has an 'any' type
function double(x) {
  return x * 2;
}

// ✅ Add explicit type
function double(x: number): number {
  return x * 2;
}
```

## Code Formatting with Prettier

### Running Prettier

```bash
# Format all files
pnpm run format

# Check formatting without changing files
pnpm run format:check
```

### Prettier Configuration

Prettier is configured in `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Editor Integration

Install Prettier extensions for your editor:

- **VS Code:** [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- **WebStorm:** Built-in, enable in Settings → Languages & Frameworks → Prettier

Enable "Format on Save" for automatic formatting.

## CI/CD Testing

### GitHub Actions

Tests run automatically on pull requests and pushes via GitHub Actions.

**Workflow includes:**

1. Install dependencies
2. Build packages
3. Run linting
4. Run type checking
5. Run unit tests
6. Run E2E tests
7. Deploy (if on main/dev branch)

### Local CI Simulation

Test your changes locally before pushing:

```bash
# Run the full CI pipeline locally
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run test:e2e --filter=webapp
```

## Testing Best Practices

### Unit Tests

1. **Test behavior, not implementation**

   ```typescript
   // ❌ Testing implementation details
   expect(component.state.isOpen).toBe(true);

   // ✅ Testing behavior
   expect(screen.getByRole("dialog")).toBeVisible();
   ```

2. **Use descriptive test names**

   ```typescript
   // ❌ Vague
   it("works", () => { ... });

   // ✅ Descriptive
   it("should display error message when email is invalid", () => { ... });
   ```

3. **Keep tests focused**
   - One assertion per test (when possible)
   - Test one scenario per test case

4. **Use arrange-act-assert pattern**

   ```typescript
   it("should calculate total correctly", () => {
     // Arrange
     const items = [{ price: 10 }, { price: 20 }];

     // Act
     const total = calculateTotal(items);

     // Assert
     expect(total).toBe(30);
   });
   ```

### E2E Tests

1. **Test critical user journeys**
   - Authentication flow
   - Core features
   - Payment processes
   - Form submissions

2. **Use data-testid for stability**

   ```typescript
   // ✅ Stable selector
   <button data-testid="submit-button">Submit</button>
   await page.click('[data-testid="submit-button"]');

   // ❌ Fragile selector
   await page.click('.btn-primary.mt-4 > span');
   ```

3. **Clean up test data**

   ```typescript
   test.afterEach(async () => {
     await cleanupDatabase();
   });
   ```

4. **Use page objects for complex flows**

   ```typescript
   class LoginPage {
     constructor(private page: Page) {}

     async login(email: string, password: string) {
       await this.page.goto("/login");
       await this.page.fill('input[name="email"]', email);
       await this.page.fill('input[name="password"]', password);
       await this.page.click('button[type="submit"]');
     }
   }

   test("user can login", async ({ page }) => {
     const loginPage = new LoginPage(page);
     await loginPage.login("user@example.com", "password");
     await expect(page).toHaveURL("/dashboard");
   });
   ```

### Linting and Type Checking

1. **Fix linting errors before committing**

   ```bash
   pnpm run lint -- --fix
   ```

2. **Don't disable rules without good reason**
   - Document why when you must disable a rule

3. **Use strict TypeScript**
   - Don't use `any` unless absolutely necessary
   - Prefer `unknown` over `any` when you must

## Debugging Tests

### Unit Tests

```bash
# Run tests with debug output
pnpm run test -- --reporter=verbose

# Run single test file
pnpm run test -- path/to/test.test.ts

# Debug in VS Code
# Add breakpoint and press F5 with Jest/Vitest debug config
```

### E2E Tests

```bash
# Run in headed mode (see browser)
pnpm run test:e2e:dev --filter=webapp -- --headed

# Run with debug mode
pnpm run test:e2e:dev --filter=webapp -- --debug

# Use Playwright Inspector
PWDEBUG=1 pnpm run test:e2e --filter=webapp
```

### View Playwright Reports

After E2E tests run:

```bash
cd apps/webapp
pnpm playwright show-report
```

## Test Coverage

### Generate Coverage Report

```bash
# Unit test coverage
pnpm run test -- --coverage

# View HTML report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Goals

Aim for:

- **80%+ overall coverage** for production code
- **100% coverage** for critical business logic
- **Lower coverage acceptable** for UI/presentation code

## Continuous Integration

### Pre-commit Hooks

Consider setting up pre-commit hooks with [Husky](https://typicode.github.io/husky/):

```bash
pnpm add -D husky lint-staged

# Configure in package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### Pre-push Checks

Run critical checks before pushing:

```bash
pnpm run typecheck && pnpm run lint && pnpm run test
```

## Troubleshooting

### Tests Fail in CI but Pass Locally

1. **Check Node version** - Ensure CI uses the same version
2. **Check environment variables** - CI may have different env vars
3. **Check timing issues** - Add longer timeouts for CI:
   ```typescript
   test("slow operation", { timeout: 10000 }, async ({ page }) => {
     // ...
   });
   ```

### Flaky E2E Tests

1. **Add explicit waits**

   ```typescript
   await page.waitForSelector('[data-testid="loaded"]');
   ```

2. **Use waitFor utilities**

   ```typescript
   await waitFor(() => {
     expect(screen.getByText("Success")).toBeInTheDocument();
   });
   ```

3. **Increase timeouts** for slow operations

### Type Errors After Package Update

```bash
# Regenerate types (if using Prisma)
pnpm run db:generate

# Rebuild packages
pnpm run build

# Restart TypeScript server in your editor
```

## Next Steps

- Set up [Storybook](https://storybook.js.org/) for component documentation
- Add visual regression testing with [Chromatic](https://www.chromatic.com/)
- Integrate with [Codecov](https://about.codecov.io/) for coverage tracking
- Explore the [Architecture](./architecture.md) to understand the testing structure
- Review [Development Guide](./development.md) for workflow integration

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
