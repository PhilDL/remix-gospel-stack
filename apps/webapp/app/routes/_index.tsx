import React from "react";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "react-router";
import { ExternalLinkIcon } from "lucide-react";

import { Badge } from "@react-router-gospel-stack/ui/components/badge";
import { Button } from "@react-router-gospel-stack/ui/components/button";
import {
  CardContent,
  CardDescription,
  CardTitle,
} from "@react-router-gospel-stack/ui/components/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@react-router-gospel-stack/ui/components/table";

import type { Route } from "./+types/_index";

export const loader = async ({
  request: _request,
  context,
}: Route.LoaderArgs) => {
  const users = await context.repositories.user.getUsers();
  return {
    users,
  };
};

export default function Index() {
  const { users } = useLoaderData<typeof loader>();

  const hasUsers = users.length > 0;

  return (
    <main className="bg-background relative flex min-h-screen flex-col sm:items-center sm:justify-center">
      <title>React Router Gospel Stack: Modern monorepo starter</title>
      <meta
        name="description"
        content="Full-stack monorepo template based on React Router + Hono and an interactive setup to scaffold Drizzle/Prisma ORM, Turso/PostgreSQL database, Docker deploy to Fly.io, pnpm, shadcn/ui, and TailwindCSS."
      />
      <meta
        name="keywords"
        content="React Router, Gospel Stack, Monorepo, Turborepo, Tailwind CSS, Shadcn/UI, Drizzle, Prisma, PostgreSQL, Turso"
      />
      <div className="relative sm:pt-8 sm:pb-16">
        <HeroSection />
        <div className="mx-auto mt-12 max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4 p-0">
              <CardTitle className="text-foreground text-5xl font-extrabold">
                Getting started
              </CardTitle>
              <CardDescription className="text-muted-foreground max-w-prose text-base">
                Opinionated defaults help you grow from prototype to production:
                use Turbo for packages, React Router for routing, Hono for
                edge-ready APIs, and Drizzle for migrations.
              </CardDescription>
            </div>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
              <div className="space-y-8">
                {gettingStartedSteps.map((step, index) => {
                  const stepNumber = String(index + 1).padStart(2, "0");
                  return (
                    <div
                      key={step.id}
                      className="bg-card rounded-lg border p-6 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold tracking-tight uppercase">
                          {stepNumber}
                        </span>
                        <div className="w-full space-y-3">
                          <h3 className="text-foreground text-xl font-semibold">
                            {step.title}
                          </h3>
                          {step.requirements ? (
                            <div className="flex flex-row items-baseline gap-2">
                              <span className="text-muted-foreground text-xs">
                                Requirements
                              </span>
                              {step.requirements.map((requirement) => (
                                <a
                                  href={requirement.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  key={requirement.label}
                                >
                                  <Badge>
                                    {requirement.label}{" "}
                                    <ExternalLinkIcon className="h-4 w-4" />
                                  </Badge>
                                </a>
                              ))}
                            </div>
                          ) : null}
                          <p className="text-muted-foreground text-sm">
                            {step.description}
                          </p>
                          {step.command ? (
                            <pre className="w-full overflow-x-auto rounded-md border border-orange-900 bg-stone-900 px-4 py-3 font-mono text-sm text-slate-100 shadow-inner">
                              <code>{step.command}</code>
                            </pre>
                          ) : null}
                          {step.commandExplainer ? (
                            <div className="text-muted-foreground flex flex-col gap-2 text-sm">
                              {step.commandExplainer}
                            </div>
                          ) : null}
                          {step.cta ? (
                            <Button
                              asChild
                              size="sm"
                              variant="secondary"
                              className="mt-2 w-fit"
                            >
                              <a
                                href={step.cta.href}
                                target="_blank"
                                rel="noreferrer"
                                tabIndex={0}
                                aria-label={step.cta.label}
                              >
                                {step.cta.label}
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <aside className="rounded-lg border border-amber-200 bg-amber-50/70 p-8 shadow-sm">
                <Badge variant="secondary">Architecture overview</Badge>
                <h3 className="text-foreground mt-1 text-2xl font-bold">
                  Classic monorepo architecture
                </h3>
                <p className="text-muted-foreground mt-3 text-sm">
                  This monorepo architecture is composed of the classic{" "}
                  <strong className="font-mono">apps</strong> and{" "}
                  <strong className="font-mono">packages</strong> structure.
                </p>
                <p className="text-muted-foreground mt-3 text-sm">
                  Most organizations have packages that are consummed directly
                  by apps, so we don't have build step for packages and use{" "}
                  <strong>just-in-time compilation</strong>. The vite bundler
                  will take care of that, and typescript config paths will help
                  you to import packages directly from the source.
                </p>
                <pre className="w-full overflow-x-auto font-mono">
                  {`
├── apps
│   └── webapp
├── config
│   ├── eslint
│   └── tsconfig
├── docs
├── packages
│   ├── business
│   ├── infrastructure (Database)
│   └── ui
├── pnpm-workspace.yaml
├── package.json
└── turbo.json
`}
                </pre>
                <div className="mt-8 rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
                  <h4 className="text-foreground text-base font-semibold">
                    Business & Infrastructure layer
                  </h4>
                  <p className="text-muted-foreground mt-2 text-sm">
                    We borrow and overly simplify DDD concepts (you are free to
                    follow it more religiously) to layer our application in a
                    way that doesn't couple the business logic to the
                    infrastructure too much.
                  </p>
                  <p className="text-muted-foreground prose mt-2 text-sm">
                    Concretly, business code will define a{" "}
                    <strong>Repository Interface</strong> and use it in business
                    actions/commands/queries. Infrastructure will implement the{" "}
                    <strong>concrete</strong> Drizzle/Prisma implementation of
                    this interface and be used by the business code.
                  </p>
                  <p className="text-muted-foreground prose mt-2 text-sm">
                    And dependency injection happens in the different apps, when
                    we setup the server.
                  </p>
                </div>
              </aside>
            </div>

            <div className="flex flex-col gap-10 border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-col gap-2">
                  <Badge variant="secondary">Full-stack</Badge>
                  <h3 className="text-foreground mt-1 text-2xl font-bold">
                    Hono server + React Router
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    We use Hono for its support for any runtime and clean
                    middleware system.
                  </p>
                </div>
                <div className="flex-1 space-y-5">
                  <p className="text-muted-foreground max-w-prose text-sm">
                    Our server file will set-up dependencies and provide
                    repositories (database access) through the{" "}
                    <strong>React Router AppLoadContext</strong>.
                  </p>
                  <p className="text-muted-foreground max-w-prose text-sm">
                    This allows you to use fully resolved repositories in your
                    loaders and actions, and keep dependency injection in one
                    file.
                  </p>
                </div>
              </div>

              <CardContent className="">
                <div className="w-full rounded-md border border-slate-200 bg-slate-50/70 p-6 shadow-sm lg:max-w-md">
                  {hasUsers ? (
                    <Table>
                      <TableCaption>
                        A list of database users, fetched from the loader.
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Name</TableHead>
                          <TableHead className="w-[200px]">Email</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => {
                          return (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.name ?? "—"}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {user.emailVerified ? (
                                  <Badge variant="default">Verified</Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    Not verified
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    // <table className="w-full table-auto border-collapse text-left">
                    //   <thead>
                    //     <tr className="border-b border-slate-200">
                    //       <th className="pb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    //         Name
                    //       </th>
                    //       <th className="pb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    //         Email
                    //       </th>
                    //       <th className="pb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    //         Status
                    //       </th>
                    //     </tr>
                    //   </thead>
                    //   <tbody className="divide-y divide-slate-200">
                    //     {users.map((user) => {
                    //       return (
                    //         <tr key={user.id} className="align-top">
                    //           <td className="text-foreground min-w-32 py-3 text-sm font-medium">
                    //             {user.name ?? "—"}
                    //           </td>
                    //           <td className="text-muted-foreground min-w-48 py-3 text-sm">
                    //             {user.email}
                    //           </td>
                    //           <td className="min-w-32 py-3 text-sm">
                    //             {user.emailVerified ? (
                    //               <Badge variant="default">Verified</Badge>
                    //             ) : (
                    //               <Badge variant="secondary">
                    //                 Not verified
                    //               </Badge>
                    //             )}
                    //           </td>
                    //         </tr>
                    //       );
                    //     })}
                    //   </tbody>
                    // </table>
                    <div className="text-muted-foreground flex flex-col items-start gap-4 text-sm">
                      <p className="text-foreground text-base font-semibold">
                        No users yet
                      </p>
                      <p>
                        An example seed script is provided in the infrastructure
                        package. It will create a test user in the database. You
                        can run it with the following command:
                      </p>
                      <pre className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 font-mono text-xs text-slate-700">
                        <code>pnpm run db:seed</code>
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-12 shadow-lg">
              <div className="absolute inset-0 opacity-40">
                <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.25),transparent_60%)]" />
              </div>
              <div className="relative flex flex-col items-start gap-6 text-white lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-prose space-y-3">
                  <h3 className="text-3xl font-semibold">
                    Do you like this stack?
                  </h3>
                  <p className="max-w-prose text-sm text-slate-200">
                    I would greatly appreciate your feedback and support,
                    consider starring the repository on GitHub and sharing it
                    with your friends.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button asChild variant="outline" size="sm">
                    <a
                      href="https://github.com/PhilDL/react-router-gospel-stack"
                      target="_blank"
                      rel="noreferrer"
                      tabIndex={0}
                      aria-label="Star the repository on GitHub"
                      className="text-foreground"
                    >
                      <img
                        alt="GitHub"
                        src="/github_light.svg"
                        className="mr-2 h-4 w-4 object-contain"
                      />
                      Star the repository
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href="https://x.com/_philDL"
                      target="_blank"
                      rel="noreferrer"
                      tabIndex={0}
                      aria-label="Follow me on X"
                    >
                      <img
                        alt="X"
                        src="/x.svg"
                        className="h-3.5 w-3.5 object-contain"
                      />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href="https://bsky.app/profile/phildl.com"
                      target="_blank"
                      rel="noreferrer"
                      tabIndex={0}
                      aria-label="Follow me on Bluesky"
                    >
                      <img
                        alt="Bluesky"
                        src="/bluesky.svg"
                        className="h-4 w-4 object-contain"
                      />
                    </a>
                  </Button>
                </div>
              </div>
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
        <h1 className="text-foreground text-3xl font-bold">Uh oh ...</h1>
        <p className="text-slate-700">Something went wrong.</p>
        <pre className="overflow-scroll rounded-md border border-slate-300 bg-white p-4 text-red-500">
          {errorMessage}
        </pre>
      </div>
    </div>
  );
}

const HeroSection = () => {
  return (
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
            React Router Monorepo Check the README.md file for instructions on
            how to get this project deployed.{" "}
          </p>
          <div className="mx-auto flex w-full flex-row items-center justify-center gap-8">
            <a
              href="https://reactrouter.com/home"
              className="items-center justify-start"
            >
              <img
                src="https://reactrouter.com/_brand/React%20Router%20Brand%20Assets/React%20Router%20Lockup/Dark.svg"
                alt="React Router"
                className="w-full max-w-64"
              />
            </a>
          </div>
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
                src: "/postgresql.svg",
                alt: "PostgreSQL",
                href: "https://www.postgresql.org",
              },
              {
                src: "/prisma.svg",
                alt: "Prisma",
                href: "https://prisma.io",
              },
              {
                src: "/drizzle-orm_light.svg",
                alt: "Drizzle",
                href: "https://orm.drizzle.team",
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
                className="border-accent hover:bg-muted group bg-accent flex h-12 w-12 justify-center rounded-lg border p-2"
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
      </div>
    </div>
  );
};

type GettingStartedStep = {
  id: string;
  title: string;
  description: React.ReactNode;
  commandExplainer?: React.ReactNode;
  command?: string;
  requirements?: { label: string; href: string }[];
  cta?: {
    label: string;
    href: string;
  };
};

const gettingStartedSteps: GettingStartedStep[] = [
  {
    id: "bootstrap",
    title: "Bootstrap the workspace",
    description:
      "Scaffold the project with degit, this will clone the repository and clean up the git history. Then cd into your newly created project.",
    command: `pnpm dlx degit PhilDL/react-router-gospel-stack my-app
cd my-app`,
    requirements: [
      {
        label: "pnpm",
        href: "https://pnpm.io/installation",
      },
    ],
  },
  {
    id: "generate-env",
    title: "Set up your stack",
    description: (
      <p>
        When you are in your project folder, install the dependencies and run
        the setup script.
      </p>
    ),
    command: "pnpm install && pnpm run setup",
    commandExplainer: (
      <div className="flex flex-col gap-2">
        <p>The setup script will prompt you to choose:</p>
        <ul className="list-inside list-disc">
          <li>The name of your monorepo organization (e.g. @my-org)</li>
          <li>
            The database you want to use: <strong>Turso</strong> or{" "}
            <strong>PostgreSQL</strong> [require Docker]
          </li>
          <li>
            The ORM you want to use: <strong>Drizzle</strong> or{" "}
            <strong>Prisma</strong>
          </li>
        </ul>
      </div>
    ),
    requirements: [
      {
        label: "Docker if choosing PostgreSQL",
        href: "https://docs.docker.com/get-docker/",
      },
    ],
  },
  {
    id: "dev-server",
    title: "Start the development server",
    description:
      "Start your the developpement server of the webapp and begin developing your application.",
    command: "pnpm dev --filter=@react-router-gospel-stack/webapp",
    cta: {
      label: "Read the development guide",
      href: "https://github.com/PhilDL/react-router-gospel-stack/blob/main/docs/development.md",
    },
  },
];
