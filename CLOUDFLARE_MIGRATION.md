# Cloudflare deployment and D1 operations

The application deploys to Cloudflare Workers through OpenNext. `wrangler.jsonc`
is the source of truth for the Worker and its `DB` D1 binding.

## Initial setup

Authenticate Wrangler before configuring secrets or deploying. The production
D1 database is already bound in `wrangler.jsonc`.

```bash
pnpm exec wrangler login
```

Configure secrets interactively; never add their values to the Wrangler config.

```bash
pnpm exec wrangler secret put CLERK_SECRET_KEY
pnpm exec wrangler secret put NOTION_SECRET
```

Set `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, the Clerk route
variables, and `NEXT_PUBLIC_NOTION_CLIENT_ID` in Cloudflare Workers Builds.
`NEXT_PUBLIC_APP_URL` must be the production origin because Notion requires an
exact OAuth redirect URL.

## D1 schema rollout

Apply migrations and exercise the application against an isolated local D1 database first:

```bash
pnpm d1:migrate:local
pnpm exec vitest run
pnpm preview
```

Only with explicit production authorization, apply the additive migrations to
the bound remote D1 database, deploy, and verify the authenticated workflows:

```bash
pnpm d1:migrate:remote
pnpm deploy
```

Remote migration and deployment commands change production state. Confirm the
target account, D1 binding, and migration list before running either command.
