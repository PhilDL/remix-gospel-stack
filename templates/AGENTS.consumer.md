# Agent Guide

This project was generated from the React Router Gospel Stack. Treat it as an application monorepo, not the upstream template.

- Use `pnpm` only, from the repo root. Node target is 22.
- Main app: `apps/webapp`; shared packages: `packages/ui`, `packages/infrastructure`, `packages/business`, and `packages/web-utils`.
- Use filters for scoped commands, e.g. `pnpm run dev --filter=@react-router-gospel-stack/webapp` or `pnpm run build --filter=@react-router-gospel-stack/webapp...`.
- Add dependencies from the root with a package filter. Prefer catalog entries in `pnpm-workspace.yaml` for shared versions.
- For env vars, update `.env.example`, `apps/webapp/app/env.server.ts`, and `apps/webapp/types/env.d.ts`.
- Database scripts run from the root: `pnpm run db:migrate:new`, `pnpm run db:migrate:apply`, and `pnpm run db:generate` when your ORM needs generation.
- Validate changes with focused `lint`, `typecheck`, `test`, and `build` commands; use `pnpm run validate` for broad checks.
- Keep TypeScript strict and ESM-compatible.
