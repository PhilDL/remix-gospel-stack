/* eslint-disable @typescript-eslint/no-unused-vars */
import { test as base, type Page } from "@playwright/test";

import { createUser } from "./db-utils.ts";

export const dataCleanup = {
  users: new Set<string>(),
};

export function deleteUserByEmail(email: string) {
  // TODO implement
  throw new Error("Not implemented");
}

export async function insertNewUser({ password }: { password?: string } = {}) {
  throw new Error("Not implemented");
  // return user
}

export const test = base.extend<{
  login: (user?: { id: string }) => ReturnType<typeof loginPage>;
}>({
  login: [
    async ({ page, baseURL }, use) => {
      await use((user) => loginPage({ page, baseURL, user }));
    },
    { auto: true },
  ],
});

export const { expect } = test;

export async function loginPage({
  page,
  baseURL = `http://localhost:${process.env.PORT}/`,
  user: givenUser,
}: {
  page: Page;
  baseURL: string | undefined;
  user?: { id: string };
}) {
  throw new Error("Not implemented");
  // set cookies
  // await page.context().addCookies([
  //   {
  //     name: "_session",
  //     sameSite: "Lax",
  //     url: baseURL,
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     value: _session,
  //   },
  // ]);
  // return user;
}

test.afterEach(async () => {
  // do something
  // type Delegate = {
  //   deleteMany: (opts: {
  //     where: { id: { in: Array<string> } };
  //   }) => Promise<unknown>;
  // };
  // async function deleteAll(items: Set<string>, delegate: Delegate) {
  //   if (items.size > 0) {
  //     await delegate.deleteMany({
  //       where: { id: { in: [...items] } },
  //     });
  //   }
  // }
  // await deleteAll(dataCleanup.users, prisma.user);
});
