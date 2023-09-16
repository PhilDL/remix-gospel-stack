import React from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { lookUpSalesPersonForZipcode } from "@remix-gospel-stack/internal-nobuild/client";
import { getSalesPersonDirectory } from "@remix-gospel-stack/internal-nobuild/queries.server";
import { Button } from "@remix-gospel-stack/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@remix-gospel-stack/ui/card";
import { Checkbox } from "@remix-gospel-stack/ui/checkbox";

// import { Checkbox } from "@remix-gospel-stack/ui/checkbox";

import Service, { helloWorld } from "~/services.server.ts";

export const loader = async ({ request: _request }: LoaderFunctionArgs) => {
  const users = await Service.userRepository.getUsers();
  const salesPersons = getSalesPersonDirectory();
  return json({
    users,
    serverValue: helloWorld("Remix Turborepo"),
    salesPersons,
  });
};

export default function Index() {
  const { serverValue, users, salesPersons } = useLoaderData<typeof loader>();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://user-images.githubusercontent.com/4941205/189402031-751764e0-2227-4f5e-a527-6763563c5911.jpg"
                alt="The Bling Boys of Alabama Gospel band singing"
              />
              <div className="absolute inset-0 bg-[color:#6a3f077d] mix-blend-multiply" />
            </div>
            <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-amber-500 drop-shadow-md">
                  Gospel Stack
                </span>
              </h1>
              <p className="mx-auto my-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                Remix Monorepo Check the README.md file for instructions on how
                to get this project deployed.{" "}
              </p>
              <div className="mx-auto flex w-full flex-row items-center justify-between gap-8">
                <a
                  href="https://turborepo.org"
                  className="flex flex-1 items-center justify-end"
                >
                  <img
                    src="https://user-images.githubusercontent.com/4941205/189468691-7b1f3967-2470-4bd2-923f-0be0041151dc.svg"
                    alt="Turborepo"
                    className="max-w-[15rem] fill-white md:max-w-[19rem]"
                  />
                </a>
                <a
                  href="https://remix.run"
                  className="flex flex-1 items-center justify-start"
                >
                  <img
                    src="https://user-images.githubusercontent.com/1500684/158298926-e45dafff-3544-4b69-96d6-d3bcc33fc76a.svg"
                    alt="Remix"
                    className="w-full max-w-[12rem] md:max-w-[16rem]"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="mt-6 flex flex-wrap justify-center gap-8">
            {[
              {
                src: "https://user-images.githubusercontent.com/4060187/106504110-82f58d00-6494-11eb-87b7-a16d4f68bc5a.png",
                alt: "Turborepo",
                href: "https://turborepo.org",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764397-ccd8ea10-b8aa-4772-a99b-35de937319e1.svg",
                alt: "Fly.io",
                href: "https://fly.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/158238105-e7279a0c-1640-40db-86b0-3d3a10aab824.svg",
                alt: "PostgreSQL",
                href: "https://www.postgresql.org/",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764484-ad64a21a-d7fb-47e3-8669-ec046da20c1f.svg",
                alt: "Prisma",
                href: "https://prisma.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764276-a516a239-e377-4a20-b44a-0ac7b65c8c14.svg",
                alt: "Tailwind",
                href: "https://tailwindcss.com",
              },
              {
                src: "https://raw.githubusercontent.com/github/explore/60cd2530141f67f07a947fa2d310c482e287e387/topics/playwright/playwright.png",
                alt: "Playwright",
                href: "https://github.com/microsoft/playwright",
              },
              {
                src: "https://user-images.githubusercontent.com/4941205/192078609-3f08928d-2811-4a33-ab32-062a77836d57.svg",
                alt: "pNPM",
                href: "https://pnpm.io/",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772447-00fccdce-9d12-46a3-8bb4-fac612cdc949.svg",
                alt: "Vitest",
                href: "https://vitest.dev",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772662-92b0dd3a-453f-4d18-b8be-9fa6efde52cf.png",
                alt: "Testing Library",
                href: "https://testing-library.com",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772934-ce0a943d-e9d0-40f8-97f3-f464c0811643.svg",
                alt: "Prettier",
                href: "https://prettier.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772990-3968ff7c-b551-4c55-a25c-046a32709a8e.svg",
                alt: "ESLint",
                href: "https://eslint.org",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157773063-20a0ed64-b9f8-4e0b-9d1e-0b65a3d4a6db.svg",
                alt: "TypeScript",
                href: "https://typescriptlang.org",
              },
            ].map((img) => (
              <a
                key={img.href}
                href={img.href}
                className="flex h-16 w-32 justify-center p-1 grayscale transition hover:grayscale-0 focus:grayscale-0"
              >
                <img alt={img.alt} src={img.src} className="object-contain" />
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-8 px-4 py-2 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Server packages</CardTitle>
              <CardDescription>
                {" "}
                packages/business, packages/database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Display prisma users from the business function{" "}
                <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  Service.userRepository.getUsers()
                </code>
                .
              </h4>
              <div className="prose prose-lg mt-4">
                <blockquote className="prose">
                  {users.length > 0 ? (
                    <React.Fragment>
                      {users.map((user) => (
                        <div key={user.id}>{JSON.stringify(user)}</div>
                      ))}
                    </React.Fragment>
                  ) : (
                    <div>No user in the database</div>
                  )}
                </blockquote>
              </div>

              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Regular server value passed from Loader here{" "}
                <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  serverValue
                </code>
                :
              </h4>
              <div className="prose prose-lg mt-4">
                <blockquote className="prose">
                  <p>{serverValue}</p>
                </blockquote>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>UI package</CardTitle>
              <CardDescription>packages/ui</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                This is an example Button Component from "ui" packages using
                shadcn/ui
              </h4>
              <div className="mx-auto flex max-w-sm flex-row items-start gap-3 sm:flex sm:max-w-none">
                <Button size="sm">Default/Primary</Button>
                <Button size="sm" variant={"secondary"}>
                  Secondary
                </Button>
                <Button size="sm" variant={"outline"}>
                  Outline
                </Button>
                <Button size="sm" variant={"ghost"}>
                  Ghost
                </Button>
              </div>
              <div>
                <Checkbox />
              </div>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Result of function{" "}
                <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  helloFromUILibrary
                </code>
                :
              </h4>
              <div className="prose prose-lg mt-4">
                <blockquote className="prose">
                  <p>Todo</p>
                </blockquote>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Internal TS Package with no build step</CardTitle>
              <CardDescription>packages/internal-nobuild</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Result of function{" "}
                <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  lookUpSalesPersonForZipcode("97", salesPersons)
                </code>
                :
              </h4>
              <div className="prose prose-lg mt-4">
                <blockquote className="prose">
                  <p>
                    {lookUpSalesPersonForZipcode("974", salesPersons)?.email}
                  </p>
                </blockquote>
              </div>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Result of function{" "}
                <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  lookUpSalesPersonForZipcode("63", salesPersons)
                </code>
                :
              </h4>
              <div className="prose prose-lg mt-4">
                <blockquote className="prose">
                  <p>
                    {lookUpSalesPersonForZipcode("63", salesPersons)?.email}
                  </p>
                </blockquote>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-md bg-slate-50 p-12">
        <h1 className="text-3xl font-bold text-slate-900">Uh oh ...</h1>
        <p className="text-slate-700">Something went wrong.</p>
        <pre className="overflow-scroll rounded-md border border-slate-300 bg-white p-4 text-red-500">
          {errorMessage}
        </pre>
      </div>
    </div>
  );
}
