import { useLoaderData } from "@remix-run/react";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@vercel/remix";

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

export const config = { runtime: "edge" };

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request: _request }: LoaderFunctionArgs) => {
  const salesPersons = getSalesPersonDirectory();
  return json({
    salesPersons,
  });
};

export default function Index() {
  const { salesPersons } = useLoaderData<typeof loader>();
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
                This a Vercel Remix app in CJS.
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
        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-8 px-4 py-2 sm:px-6 lg:grid-cols-2 lg:px-8">
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
