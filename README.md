# Docket

Docket is a private reading library for saved web excerpts and readable article snapshots. The web application is a standalone Next.js App Router project deployed to Cloudflare Workers through OpenNext, with Clerk authentication, Prisma-backed D1 metadata, D1 FTS5 search, and private R2 article bodies.

The Chrome extension is maintained separately in `../docket-extension`. It can save selected text and media, or extract a complete article locally with pinned `defuddle@0.19.1` before sending the cleaned snapshot to Docket.

## Local development

Install dependencies and start Next.js:

```bash
pnpm install
pnpm dev
```

Apply the D1 migrations to an isolated local database before testing article APIs:

```bash
pnpm d1:migrate:local
```

Article storage expects the `ARTICLE_BUCKET` R2 binding declared in `wrangler.jsonc`. Local Wrangler and OpenNext previews provide local emulation; production and preview buckets must be created explicitly before deployment. See [article storage and rollout](docs/implementation/article-storage-rollout.md).

## Verification

```bash
pnpm exec vitest run
pnpm lint
pnpm build
pnpm preview
```

Run the extension independently:

```bash
pnpm --dir ../docket-extension test
pnpm --dir ../docket-extension typecheck
pnpm --dir ../docket-extension build
```

## Documentation

- [Article library architecture](docs/design/article-library.md)
- [Article and search API](docs/reference/article-api.md)
- [Article storage and rollout](docs/implementation/article-storage-rollout.md)
- [Saving and reading articles](docs/user/saving-articles.md)
- [Chrome Web Store disclosure](docs/reference/chrome-web-store-disclosure.md)
