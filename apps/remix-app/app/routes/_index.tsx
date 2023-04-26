import React from "react";
import { json, type LoaderArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import {
  lookUpSalesPersonForZipcode,
  type SalesPersonDirectory,
} from "@remix-gospel-stack/internal-nobuild";
import { Button, helloFromUILibrary } from "@remix-gospel-stack/ui";

import Service, { helloWorld } from "~/services.server";

export const loader = async ({ request }: LoaderArgs) => {
  const users = await Service.userRepository.getUsers();
  return json({ users, serverValue: helloWorld("Remix Turborepo") });
};

export default function Index() {
  const { serverValue, users } = useLoaderData<typeof loader>();
  const salesPersons: SalesPersonDirectory = [
    {
      name: "mark",
      email: "mark@remix-gospel-stack.com",
      regexp:
        /^01|^73|^74|^05|^38|^69|^42|^43|^07|^26|^04|^06|^83|^13|^84|^30|^07|^48|^12|^2B|^2A/,
    },
    {
      name: "coltrane",
      email: "coltrane@remix-gospel-stack.com",
      regexp:
        /^62|^59|^80|^60|^02|^08|^77|^51|^10|^89|^21|^52|^55|^71|^39|^25|^70|^90|^88|^54|^57|^67|^68/,
    },
    {
      name: "philippe",
      regexp:
        /^33|^24|^16|^17|^87|^23|^36|^18|^41|^37|^86|^79|^85|^86|^18|^58|^03|^23|^63|^15|^19|^23|^87|^19|^46|^15|^46|^82|^81|^34|^66|^11|^09|^31|^32|^65|^64|^40|^47|^82/,
      email: "philippe@remix-gospel-stack.com",
    },
    {
      name: "lance",
      email: "lance@remix-gospel-stack.com",
      regexp:
        /^76|^27|^78|^95|^94|^93|^92|^91|^45|^28|^41|^37|^72|^61|^14|^50|^35|^56|^22|^29|^44|^49|^53/,
    },
    { name: "john", email: "john@remix-gospel-stack.com", regexp: /^974|^976/ },
    {
      name: "mike",
      email: "mike@remix-gospel-stack.com",
      regexp: /^971|^972|^973|^975|^984|^986|^987|^988/,
    },
  ];
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
                src: "https://user-images.githubusercontent.com/1500684/157764454-48ac8c71-a2a9-4b5e-b19c-edef8b8953d6.svg",
                alt: "Cypress",
                href: "https://www.cypress.io",
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
        <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-8 px-4 py-2 sm:px-6 lg:px-8">
          <div>
            <h2>
              <span className="block text-lg font-semibold text-orange-600">
                packages/business, packages/database
              </span>
              <span className="mt-1 block text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                Server packages
              </span>
            </h2>
            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              Display prisma users from the business function{" "}
              <code className="bg-gray-200 px-1 text-orange-600">
                Service.userRepository.getUsers()
              </code>
              .
            </h3>
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

            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              Regular server value passed from Loader here{" "}
              <code className="bg-gray-200 px-1 text-orange-600">
                serverValue
              </code>
              :
            </h3>
            <div className="prose prose-lg mt-4">
              <blockquote className="prose">
                <p>{serverValue}</p>
              </blockquote>
            </div>
          </div>
          <div>
            <h2 className="mt-4">
              <span className="block text-lg font-semibold text-orange-600">
                packages/ui
              </span>
              <span className="mt-2 block text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                Ui packages
              </span>
            </h2>
            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              This is an example Button Component from "ui" packages
            </h3>
            <div className="mx-auto flex max-w-sm flex-col items-start sm:flex sm:max-w-none">
              <Button />
            </div>
            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              Result of function{" "}
              <code className="bg-gray-200 px-1 text-orange-600">
                helloFromUILibrary
              </code>
              :
            </h3>
            <div className="prose prose-lg mt-4">
              <blockquote className="prose">
                <p>{helloFromUILibrary()}</p>
              </blockquote>
            </div>
          </div>
          <div>
            <h2 className="mt-4">
              <span className="block text-lg font-semibold text-orange-600">
                packages/internal-nobuild
              </span>
              <span className="mt-2 block text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                Internal TS Package with no build step
              </span>
            </h2>
            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              Result of function{" "}
              <code className="text-md bg-gray-200 px-1 text-orange-600">
                lookUpSalesPersonForZipcode("97", salesPersons)
              </code>
              :
            </h3>
            <div className="prose prose-lg mt-4">
              <blockquote className="prose">
                <p>{lookUpSalesPersonForZipcode("974", salesPersons)?.email}</p>
              </blockquote>
            </div>
            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              Result of function{" "}
              <code className="text-md bg-gray-200 px-1 text-orange-600">
                lookUpSalesPersonForZipcode("63", salesPersons)
              </code>
              :
            </h3>
            <div className="prose prose-lg mt-4">
              <blockquote className="prose">
                <p>{lookUpSalesPersonForZipcode("63", salesPersons)?.email}</p>
              </blockquote>
            </div>
          </div>
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
