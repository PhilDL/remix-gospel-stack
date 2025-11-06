import React from "react";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "react-router";

import { helloWorld } from "@react-router-gospel-stack/business/shared/utils";
import { lookUpSalesPersonForZipcode } from "@react-router-gospel-stack/internal-nobuild/client";
import { getSalesPersonDirectory } from "@react-router-gospel-stack/internal-nobuild/queries.server";
import { Button } from "@react-router-gospel-stack/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@react-router-gospel-stack/ui/components/card";
import { Checkbox } from "@react-router-gospel-stack/ui/components/checkbox";

import type { Route } from "./+types/_index";

export const loader = async ({
  request: _request,
  context,
}: Route.LoaderArgs) => {
  const users = await context.repositories.user.getUsers();
  const salesPersons = getSalesPersonDirectory();
  return {
    users,
    serverValue: helloWorld("React Router Gospel Stack"),
    salesPersons,
  };
};

export default function Index() {
  const { serverValue, users, salesPersons } = useLoaderData<typeof loader>();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pt-8 sm:pb-16">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://user-images.githubusercontent.com/4941205/189402031-751764e0-2227-4f5e-a527-6763563c5911.jpg"
                alt="The Bling Boys of Alabama Gospel band singing"
              />
              <div className="absolute inset-0 bg-[#6a3f077d] mix-blend-multiply" />
            </div>
            <div className="relative bg-stone-900/40 px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32 lg:pb-20">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block text-amber-500 uppercase drop-shadow-md">
                  Gospel Stack
                </span>
              </h1>
              <p className="mx-auto my-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                React Router Monorepo Check the README.md file for instructions
                on how to get this project deployed.{" "}
              </p>
              <div className="mx-auto flex w-full flex-row items-center justify-center gap-8">
                {/* <a
                  href="https://turborepo.org"
                  className="flex flex-1 items-center justify-end"
                >
                  <img
                    src="https://user-images.githubusercontent.com/4941205/189468691-7b1f3967-2470-4bd2-923f-0be0041151dc.svg"
                    alt="Turborepo"
                    className="max-w-60 fill-white md:max-w-76"
                  />
                </a> */}
                <a
                  href="https://reactrouter.com/home"
                  className="items-center justify-start"
                >
                  <img
                    src="https://reactrouter.com/_brand/React%20Router%20Brand%20Assets/React%20Router%20Lockup/Dark.svg"
                    alt="React Router"
                    className="w-full max-w-[24rem]"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {[
              {
                src: "/turborepo-icon-light.svg",
                alt: "Turborepo",
                href: "https://turborepo.org",
              },
              {
                src: "/fly.svg",
                alt: "Fly.io",
                href: "https://fly.io",
              },
              {
                src: "/turso-light.svg",
                alt: "Turso",
                href: "https://turso.tech",
              },
              {
                src: "/prisma.svg",
                alt: "Prisma",
                href: "https://prisma.io",
              },
              {
                src: "/tailwindcss.svg",
                alt: "Tailwind",
                href: "https://tailwindcss.com",
              },
              {
                src: "/shadcn-ui.svg",
                alt: "Shadcn/UI",
                href: "https://ui.shadcn.com",
              },
              {
                src: "/pnpm.svg",
                alt: "pNPM",
                href: "https://pnpm.io/",
              },

              {
                src: "/typescript.svg",
                alt: "TypeScript",
                href: "https://typescriptlang.org",
              },
            ].map((img) => (
              <a
                key={img.href}
                href={img.href}
                className="border-input hover:bg-muted group flex h-16 w-16 justify-center rounded-lg border p-2"
              >
                <img
                  alt={img.alt}
                  src={img.src}
                  className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
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
                packages/business, packages/infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Display prisma users from the AppLoadContext repository
                <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  context.repositories.user.getUsers()
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
