# Cloudflare deployment and D1 migration

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

## Database cutover

1. Apply and test the D1 schema locally.
2. Apply the migrations to the remote D1 database.
3. Put Railway writes into maintenance mode.
4. Export the final PostgreSQL snapshot and import it into D1.
5. Validate row counts before directing traffic to the Worker.

The export reads `DATABASE_URL` from `.env.local`. Set `DATABASE_SSL=true` if
the source PostgreSQL endpoint requires TLS.

```bash
pnpm d1:migrate:local
pnpm d1:migrate:remote
pnpm db:export:railway
pnpm exec wrangler d1 execute docket --remote --file .migration/railway-data.sql
pnpm db:validate
pnpm deploy
```

Run `pnpm preview` before production deployment to exercise the application in
the Workers runtime. Keep Railway available but read-only until the D1 counts
and the main authenticated workflows have been verified.
