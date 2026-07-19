# Article Storage and Rollout

## Provisioning

`wrangler.jsonc` declares one private binding:

- production: `docket-articles`
- preview: `docket-articles-preview`
- Worker binding: `ARTICLE_BUCKET`

Create the buckets only during an explicitly authorized rollout:

```bash
pnpm exec wrangler r2 bucket create docket-articles
pnpm exec wrangler r2 bucket create docket-articles-preview
pnpm cf-typegen
```

Do not expose either bucket through a public development URL or custom domain. Article media remains publisher-hosted; the bucket stores sanitized HTML bodies only.

Apply the additive migration locally first, then to remote D1 only with deployment approval:

```bash
pnpm d1:migrate:local
pnpm d1:migrate:remote
```

Migration `0003_article_library.sql` adds article/version/alias/search tables, nullable excerpt linkage, excerpt search backfill, FTS triggers, lifecycle checks, and indexes. It preserves the legacy excerpt FTS table for older clients.

Migration `0004_normalize_article_published_at.sql` prepares publication metadata for Prisma's `DateTime` mapping. It converts parseable legacy values to UTC ISO-8601 timestamps and clears values that cannot be represented as dates. Apply it before deploying a web build generated from the `DateTime` schema; otherwise an incompatible legacy value can make Prisma reject the article row while reading it.

## Deployment order

1. Create the private production and preview R2 buckets and verify bindings in preview.
2. Apply all pending D1 migrations and verify foreign keys, FTS triggers, the existing-excerpt backfill, and publication-date normalization.
3. Deploy the web application and verify authenticated article APIs, reader, restore, deletion retry, unified search, and Site integration.
4. Publish the extension only after the backend is healthy.
5. Update the Chrome Web Store data-use disclosure before extension review.

The extension should be rolled back before the backend if a release fails. Keep the additive D1 schema and R2 data in place so already-saved articles remain readable and older extension clients remain compatible.

## Verification

The test suite includes Miniflare integration coverage using real local D1 and R2 bindings. It covers create/version/unchanged flows, legacy publication-date normalization, both excerpt-linking orders, restore, hash/missing-object handling, cross-user isolation, concurrent history, storage failure, retryable deletion, and excerpt preservation.

Also run:

```bash
pnpm exec vitest run
pnpm lint
pnpm build
pnpm preview
pnpm --dir ../docket-extension test
pnpm --dir ../docket-extension typecheck
pnpm --dir ../docket-extension build
```

Remote migrations, bucket creation, and deployment require credentials and alter remote state. They are not routine local verification commands.

## Runtime and build constraints

Article HTML is sanitized through a DOM-free HAST allowlist so the server bundle remains compatible with the Cloudflare Workers runtime. Do not reintroduce a Node DOM implementation such as JSDOM into the request or reader path.

`next.config.ts` disables Next.js's experimental webpack build worker. OpenNext requires the React Server Component client-reference manifest and its owning server chunks to be produced in the same build process for deterministic Worker bundles. The article reader also sends `Referrer-Policy: no-referrer`; audio and video snapshots use `preload="none"`, while images remain lazy-loaded.

## Operations

Monitor counts and latency by outcome without recording article content, bearer tokens, canonical query values, or extracted metadata:

- extraction and validation failures
- `created`, `versioned`, and `unchanged` saves
- sanitized body size and parse-duration distributions
- R2 put/get/delete failures and hash mismatches
- search latency and result errors
- restore conflicts and missing bodies
- deletion failures and age of `DELETING` rows

Retry stale `DELETING` articles through the idempotent delete endpoint. If an R2 deletion failed after a D1 save failure, reconcile bucket inventory against distinct `ArticleVersion.content_key` and `Article.current_content_key` values before removing unreferenced objects. Never infer deletion targets from user input alone.
