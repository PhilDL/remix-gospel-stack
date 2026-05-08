# Agent Guide

This is an open-source template repo. Most real work is on setup tooling, scripts, dependency catalogs, generated files, docs, and CI; the checked-in app/packages are examples and fixtures for the generated user project.

- Use `pnpm` only, from the repo root. Node target is 22; orchestration is through Turborepo scripts in `package.json` and `turbo.json`.
- Treat `scripts/setup.mjs`, `pnpm-workspace.yaml`, root package scripts, Docker/Fly config, generators, docs, and lockfile behavior as primary product surface.
- This root file is for maintainers of this template repo. The consumer-facing guide is `templates/AGENTS.consumer.md`, and setup writes it to `AGENTS.md` in generated projects.
- Keep changes generic for downstream apps. Do not hard-code local repo paths, private assumptions, or one-off app behavior into template tooling.
- Prefer catalog entries in `pnpm-workspace.yaml` for shared dependency versions; update package manifests and `pnpm-lock.yaml` consistently.
- Database/ORM choices are scaffold outputs. When touching setup or infrastructure templates, consider all combinations: Turso/PostgreSQL and Drizzle/Prisma.
- New env vars must flow through examples, setup output, validation, and docs: `.env.example`, `apps/webapp/app/env.server.ts`, `apps/webapp/types/env.d.ts`, and relevant README/docs.
- Local checks are useful but not sufficient: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build`, or `pnpm run validate`.
- Template verification should use a disposable fresh project: copy the repo or use `pnpm dlx degit PhilDL/react-router-gospel-stack <tmp-app>`, then run `pnpm install`, `pnpm run setup`, and a fresh `pnpm run build`/`pnpm run validate` in that copy.
- For setup changes, smoke-test at least the default Drizzle + Turso path; test other DB/ORM paths when affected.
- Update docs whenever install, setup, scripts, dependency policy, generated names, env handling, database behavior, or deployment behavior changes.
