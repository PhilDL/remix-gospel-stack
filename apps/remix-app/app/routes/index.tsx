import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import Service, { helloWorld } from "~/services.server";
import { Button, helloFromUILibrary } from "@my-company/ui";
import { lookUpSalesPersonForZipcode } from "@my-company/internal-nobuild";
import type { SalesPersonDirectory } from "@my-company/internal-nobuild";
import React from "react";

export const loader = async ({ request }: LoaderArgs) => {
  const users = await Service.userRepository.getUsers();
  return json({ users, serverValue: helloWorld("Remix Turborepo") });
};

export default function Index() {
  const { serverValue, users } = useLoaderData<typeof loader>();
  const salesPersons: SalesPersonDirectory = [
    {
      name: "mark",
      email: "mark@my-company.com",
      regexp: /^01|^73|^74|^05|^38|^69|^42|^43|^07|^26|^04|^06|^83|^13|^84|^30|^07|^48|^12|^2B|^2A/,
    },
    {
      name: "coltrane",
      email: "coltrane@my-company.com",
      regexp: /^62|^59|^80|^60|^02|^08|^77|^51|^10|^89|^21|^52|^55|^71|^39|^25|^70|^90|^88|^54|^57|^67|^68/,
    },
    {
      name: "philippe",
      regexp:
        /^33|^24|^16|^17|^87|^23|^36|^18|^41|^37|^86|^79|^85|^86|^18|^58|^03|^23|^63|^15|^19|^23|^87|^19|^46|^15|^46|^82|^81|^34|^66|^11|^09|^31|^32|^65|^64|^40|^47|^82/,
      email: "philippe@my-company.com",
    },
    {
      name: "lance",
      email: "lance@my-company.com",
      regexp: /^76|^27|^78|^95|^94|^93|^92|^91|^45|^28|^41|^37|^72|^61|^14|^50|^35|^56|^22|^29|^44|^49|^53/,
    },
    { name: "john", email: "john@my-company.com", regexp: /^974|^976/ },
    { name: "mike", email: "mike@my-company.com", regexp: /^971|^972|^973|^975|^984|^986|^987|^988/ },
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
            <div className="relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-amber-500 drop-shadow-md">Gospel Stack</span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                Remix Monorepo Check the README.md file for instructions on how to get this project deployed.{" "}
              </p>
              <div className="flex flex-row mx-auto w-full justify-between items-center gap-8">
                <a href="https://turborepo.org" className="flex-1 flex justify-end items-center">
                  <img
                    src="https://user-images.githubusercontent.com/4941205/189468691-7b1f3967-2470-4bd2-923f-0be0041151dc.svg"
                    alt="Turborepo"
                    className="max-w-[15rem] md:max-w-[19rem] fill-white"
                  />
                </a>
                <a href="https://remix.run" className="flex-1 flex justify-start items-center">
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

        <div className="mx-auto max-w-7xl py-2 px-4 sm:px-6 lg:px-8">
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
                src: "https://user-images.githubusercontent.com/1500684/157772386-75444196-0604-4340-af28-53b236faa182.svg",
                alt: "MSW",
                href: "https://mswjs.io",
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
        <div className="mx-auto max-w-7xl py-2 px-4 sm:px-6 lg:px-8 flex-col flex gap-8 mt-12">
          <div>
            <h2>
              <span className="block text-lg font-semibold text-orange-600">packages/business, packages/database</span>
              <span className="mt-1 block text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                Server packages
              </span>
            </h2>
            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              Display prisma users from the business function{" "}
              <code className="text-orange-600 bg-gray-200 px-1">Service.userRepository.getUsers()</code>.
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
              <code className="text-orange-600 bg-gray-200 px-1">serverValue</code>:
            </h3>
            <div className="prose prose-lg mt-4">
              <blockquote className="prose">
                <p>{serverValue}</p>
              </blockquote>
            </div>
          </div>
          <div>
            <h2 className="mt-4">
              <span className="block text-lg font-semibold text-orange-600">packages/ui</span>
              <span className="mt-2 block text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                Ui packages
              </span>
            </h2>
            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              This is an example Button Component from "ui" packages
            </h3>
            <div className="mx-auto max-w-sm sm:flex flex flex-col sm:max-w-none items-start">
              <Button />
            </div>
            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              Result of function <code className="text-orange-600 bg-gray-200 px-1">helloFromUILibrary</code>:
            </h3>
            <div className="prose prose-lg mt-4">
              <blockquote className="prose">
                <p>{helloFromUILibrary()}</p>
              </blockquote>
            </div>
          </div>
          <div>
            <h2 className="mt-4">
              <span className="block text-lg font-semibold text-orange-600">packages/internal-nobuild</span>
              <span className="mt-2 block text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                Internal TS Package with no build step
              </span>
            </h2>
            <h3 className="mt-3 block text-lg font-semibold text-gray-600">
              Result of function{" "}
              <code className="text-orange-600 bg-gray-200 px-1 text-md">
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
              <code className="text-orange-600 bg-gray-200 px-1 text-md">
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
