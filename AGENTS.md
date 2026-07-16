# AGENTS.md

This document defines how AI agents should work in the Docket repository.

Agents must follow these conventions when reading, modifying, or generating code.

## 1. Repository Shape

This repository is the Docket web application. It is a standalone pnpm project built with Next.js App Router, React, TypeScript, Clerk, Prisma, Cloudflare Workers through OpenNext, and Cloudflare D1.

Current structure:

- `app`: routes, layouts, route-local components, and API route handlers
- `components`: reusable React components
- `hooks`: reusable React hooks
- `lib`: shared application, database, conversion, and Notion integration logic
- `store`: client-side state
- `types`: project-level TypeScript declarations
- `tests`: Vitest tests
- `prisma`: Prisma schema and historical Prisma migrations
- `migrations`: Cloudflare D1 migrations used by Wrangler
- `scripts`: database migration and validation utilities
- `public`: static assets and Cloudflare asset headers
- `docs`: design, implementation, research, reference, and user documentation

Supporting files:

- `package.json`: project scripts and dependencies
- `pnpm-lock.yaml`: dependency lockfile
- `next.config.ts`: Next.js and OpenNext development configuration
- `wrangler.jsonc`: Cloudflare Worker, assets, service binding, and D1 configuration
- `vitest.config.ts`: test configuration
- `README.md`: project setup and environment notes

Preserve this single-application layout. Do not introduce workspace or monorepo conventions unless the user explicitly requests a repository restructure.

## 2. Related Docket Extension Repository

The Docket Chrome extension lives in a separate sibling repository at `../docket-extension`.

Whenever a task, issue, or document mentions the **Docket extension**, **Docket Chrome extension**, **browser extension**, or **Chrome extension** in the context of Docket, interpret it as the project at `../docket-extension` unless the context clearly says otherwise.

Rules for cross-repository work:

- Treat this repository and `../docket-extension` as separate projects with separate dependencies, lockfiles, scripts, and Git histories.
- Web application changes belong here; extension content scripts, popup/pages, manifest behavior, and browser APIs belong in `../docket-extension`.
- Check both sides when changing an API contract or user flow shared by the web app and extension.
- Do not copy extension code into this repository to avoid making an intentional cross-repository change.
- Do not modify `../docket-extension` unless the user's request includes extension work.

The extension uses pnpm, Vite, React, and TypeScript. Run its commands from its own repository, for example:

```bash
pnpm --dir ../docket-extension dev
pnpm --dir ../docket-extension build
pnpm --dir ../docket-extension pretty
```

## 3. Package Manager And Commands

Use pnpm for package management and task execution.

Rules:

- Use `pnpm install` for dependency installation.
- Use `pnpm add` / `pnpm remove` for dependency changes.
- Use `pnpm run <script>` for project scripts.
- Do not introduce Bun, npm, or Yarn commands unless the user explicitly asks.
- Keep `pnpm-lock.yaml` synchronized with dependency changes.

Common commands:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test
pnpm preview
pnpm deploy
pnpm cf-typegen
pnpm d1:migrate:local
pnpm d1:migrate:remote
pnpm db:export:railway
pnpm db:validate
```

Cloudflare deployment and remote D1 migration commands change external state. Run them only when the user explicitly requests the corresponding deployment or migration.

## 4. Development Workflow

When implementing a change:

1. Read the owning route, component, or module and its nearby conventions first.
2. Prefer updating existing modules over creating unnecessary new abstractions.
3. Keep route-specific code near its route under `app`.
4. Move UI into `components` only when it is meaningfully reused.
5. Keep reusable hooks in `hooks` and shared non-UI logic in `lib`.
6. Keep API request handling in `app/api` and database access behind the existing Prisma/D1 patterns.
7. Update `README.md` when setup, environment variables, or developer workflows change materially.
8. Update the appropriate `docs` section when behavior, architecture, integrations, or implementation decisions change.

Before creating a new top-level directory, confirm that it fits the current standalone app structure.

## 5. Placement Rules

Use these placement rules by default:

- Pages, layouts, and route-local UI: `app`
- API route handlers: `app/api/<resource>/route.ts`
- Home and document-reading flows: `app/home`
- Shared React components: `components`
- Shared React hooks: `hooks`
- Database client setup: `lib/prisma.ts`
- Notion integration: `lib/notion`
- Shared application utilities and conversion logic: `lib`
- Client state: `store`
- Global or ambient types: `types`
- Automated tests: `tests`
- D1 schema migrations applied by Wrangler: `migrations`
- Prisma schema and Prisma-specific migration history: `prisma`
- Static files: `public`

Prefer colocating code with its owning route until it is clearly reused.

## 6. Coding Rules

Agents must follow these rules:

- Prefer readability over cleverness.
- Keep functions and components focused.
- Avoid duplication while resisting premature abstraction.
- Follow existing naming, import, and file conventions.
- Prefer TypeScript for application code.
- Preserve the current stack unless there is a concrete, documented reason to change it.
- Do not introduce a new framework or state library without justification.
- Respect server and client component boundaries; add `"use client"` only where browser APIs, client state, effects, or event handlers require it.
- Keep authentication aligned with the existing Clerk integration.
- Keep persistence aligned with Prisma and Cloudflare D1 constraints.
- Sanitize or safely transform external HTML and document content using the established utilities.

When a web change affects data sent by or displayed in the Docket extension, inspect the contract in `../docket-extension` and keep compatibility explicit.

## 7. Tests And Verification

This repository uses Vitest for automated tests. Always run the strongest relevant verification for the area changed.

Default verification commands:

```bash
pnpm test
pnpm lint
pnpm build
```

Choose verification proportionally:

- Run focused Vitest tests while iterating, then the full relevant suite before finishing.
- Run `pnpm build` for changes involving routing, server/client boundaries, configuration, database generation, or deployment behavior.
- Run `pnpm db:validate` when changing the Railway-to-D1 migration path or D1 schema assumptions.
- Build `../docket-extension` when a requested cross-repository change affects extension code or its integration contract.

If a command is unavailable, broken independently of the change, requires credentials, or would change remote state, do not conceal that limitation; state it in the final response.

## 8. Documentation Rules

Documentation must describe the real Docket system rather than a generic template.

This repository uses a dedicated `docs` tree:

- `docs/design`: architecture, system boundaries, and design decisions
- `docs/implementation`: technical implementation notes, migrations, and engineering workflows
- `docs/research`: investigations, experiments, and spikes
- `docs/reference`: APIs, third-party integrations, configuration, and reference material
- `docs/user`: user-facing workflows and product documentation

Update documentation when:

- environment variables or local setup change
- development, deployment, or migration workflows change
- public application or Docket extension behavior changes materially
- web-to-extension API contracts change
- architecture or important implementation decisions change
- an investigation produces conclusions worth preserving

Documentation placement:

- Repository setup and quickstart: `README.md`
- Architecture and design decisions: `docs/design`
- Implementation details and migration notes: `docs/implementation`
- Research and exploratory findings: `docs/research`
- API, Clerk, Notion, Cloudflare, D1, and extension integration references: `docs/reference`
- End-user web app and extension guides: `docs/user`
- Extension-only developer setup: `../docket-extension/README.md`

Keep each section's `README.md` updated as an index when adding documents.

## 9. Commit And Push Discipline

Before any commit or push, perform an end-to-end review of the whole change set, not only the files edited in the last step.

Required standard:

- Review the full diff with long-term maintainability in mind.
- Check for redundancy, unnecessary complexity, avoidable coupling, and accidental generated-file changes.
- Confirm that names, boundaries, and abstractions fit this repository.
- Verify that web and extension contracts remain compatible when either side changes.
- Update documentation wherever behavior, workflows, architecture, integrations, or operational understanding changed materially.
- Run the relevant tests, lint, build, and migration validation before publishing when feasible.

Do not commit or push changes in `../docket-extension` as part of this repository's Git operation. Each repository requires its own deliberate review and Git operation.

## 10. Dependencies And Safety

Agents must not:

- switch package managers
- convert the project into a monorepo without explicit direction
- delete large sections of code without clear justification
- modify dependencies without explaining why
- commit generated `.next`, `.open-next`, `.wrangler`, or dependency output
- run remote migrations or deployments merely as verification
- expose Clerk, Cloudflare, Notion, database, or other credentials in code, logs, or documentation

When modifying dependencies, prefer the smallest change compatible with the existing Next.js, React, OpenNext, Prisma, and Cloudflare ecosystem.

## 11. Skills And Repo-Specific Guidance

Use matching repository or globally available agent skills when the task clearly fits them. In particular, use current Cloudflare, Wrangler, and Workers guidance for deployment or runtime work, and browser automation guidance for UI validation when requested.

Read only the relevant skill instructions needed for the task.

## 12. Completion Requirements

Before finishing a task:

1. Ensure changes are placed in the correct repository and directory.
2. Keep the existing architecture and conventions intact.
3. Run relevant verification commands when feasible.
4. Update documentation when workflows, behavior, integrations, or setup changed.
5. Review cross-repository compatibility when the Docket extension is involved.
6. Clearly note unverified areas, follow-up work, and assumptions.
