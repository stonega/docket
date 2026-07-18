# Article Library Architecture

## Boundary

Article saves begin only from the Docket extension. On an HTTPS page, the content script runs the browser core build of `defuddle@0.19.1` synchronously against the rendered document with asynchronous extractors disabled. It sends cleaned HTML and bounded metadata to the authenticated Docket API. No URL-import service, hosted extractor, or third-party extraction fallback is involved.

The web application validates the payload again, normalizes source and canonical aliases, sanitizes HTML with a server allowlist, computes content and snapshot fingerprints, and rejects empty or oversized content. The sanitized HTML is the only body representation Docket stores.

## Storage split

- D1 owns user-scoped article identity, Sites, aliases, immutable version metadata, excerpt relationships, lifecycle state, and current search documents.
- A private Standard-class R2 bucket owns sanitized UTF-8 HTML. Keys are content addressed under `articles/<encoded-user-id>/<article-id>/<sha256>.html`.
- Remote HTTPS media URLs remain in the sanitized snapshot. Docket does not copy publisher media into R2.
- D1 FTS5 indexes current article chunks and excerpt text. Historical article bodies are not searchable.

This split keeps unbounded bodies out of D1 while allowing relational ownership checks and lifecycle operations to remain queryable.

## Identity and versioning

`ArticleUrlAlias` stores normalized source and canonical URLs with a uniqueness boundary of `(user_id, normalized_url)`. URL normalization removes credentials, fragments, default ports, and common tracking parameters; lowercases scheme and host; sorts remaining query parameters; and normalizes trailing slashes.

An identical fingerprint returns `unchanged`. A changed fingerprint creates an immutable `ArticleVersion` and advances the article’s current-version pointer. Restoring history creates another version whose `restored_from_version_id` points at the selected snapshot.

The `ArticleVersion_current_guard` D1 trigger requires each new version to extend the current version of an `ACTIVE` article. Together with the unique predecessor index, this makes history linear under concurrent saves and prevents an in-flight save from appending after deletion starts.

## Atomic writes

Prisma remains the typed query layer for reads and single-row operations. Prisma’s D1 adapter does not currently provide transactional guarantees, so multi-row article, restore, deletion, and excerpt-index writes use D1’s native atomic `batch()` API. Pre-generated UUIDs keep dependent inserts deterministic without interactive transactions.

Search rows are grouped ten at a time per prepared insert. This stays below D1’s 100-bound-parameter limit and keeps a maximum-size article lifecycle batch below the Workers Free query-per-invocation ceiling.

R2 and D1 cannot share a distributed transaction. Save writes the content-addressed R2 body first, then commits D1 metadata atomically. A failed D1 commit removes the unreferenced object where safe. Deletion first marks the article `DELETING`, removes every distinct R2 key, then atomically removes metadata. A failed object deletion leaves the hidden `DELETING` row available for an idempotent retry.

## Search

Current article plain text is normalized and divided at word/grapheme boundaries into approximately 48 KiB UTF-8 chunks. `SearchDocument` rows are mirrored into `SearchDocument_fts` by D1 triggers. Search materializes matching FTS rows, applies title-weighted BM25 ranking, selects the best-ranked chunk for each entity, and then paginates one discriminated article or excerpt result per entity.

## Reader safety

The server-rendered reader retrieves owned content from private R2 and verifies its SHA-256 hash before rendering. Stored HTML has no scripts, inline handlers, styles, forms, frames, objects, or inline SVG. External links are isolated, images load lazily without a referrer, and missing remote media or R2 objects produce explicit fallback states.
