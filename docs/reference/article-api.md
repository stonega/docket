# Article and Library Search API

All endpoints require Clerk authentication, accept bearer authentication from the extension, enforce user ownership, and return JSON errors as `{ "error": { "code", "message" } }`. Extension-facing routes include CORS and `OPTIONS` responses. Article HTML is never returned by these APIs; the server reader retrieves it from private R2.

## Articles

### `POST /api/article`

Accepts `ArticleSaveRequest`: cleaned HTML, source URL, optional canonical URL, title, and optional author, description, site, publication date, image, favicon, language, word count, and parse duration.

When present, `publishedAt` must be a valid date string. The server normalizes it to an ISO-8601 timestamp before persistence and returns it in that format.

Returns `201` for `created` or `200` for `versioned`/`unchanged` with:

```json
{
  "outcome": "created",
  "article": { "id": "…", "title": "…" },
  "versionId": "…",
  "linkedExcerptCount": 2
}
```

The complete `article` value is an `ArticleSummary`. The sanitized body limit is 5 MiB. Invalid or empty sanitized content returns `422`; oversized requests or bodies return `413`.

### `GET /api/article`

Returns current `ArticleSummary` values ordered by recent activity. Query parameters:

- `page` (default `1`)
- `page_size` (default `20`, maximum `100`)
- `site_id` (optional owned-Site filter)

### `GET /api/article/:id`

Returns an owned `ArticleDetail`: current summary, current version, the latest version summaries, and associated excerpts in newest-first creation order. Use the versions endpoint to paginate older history.

### `GET /api/article/:id/versions`

Returns paginated immutable `ArticleVersionSummary` values.

### `POST /api/article/:id/restore`

Body: `{ "versionId": "…" }`. The selected owned body must exist and match its stored hash. A successful restore returns the new `versionId`; it never modifies an existing version.

### `DELETE /api/article/:id`

Returns `204`. Deletion is idempotent. The article is hidden as soon as it enters `DELETING`; all version objects are removed from R2 before metadata is removed. Associated excerpts are retained with `articleId = null`.

## Search

### `GET /api/search?q=…`

Returns paginated `LibrarySearchResult` values. Each result has a discriminating `kind` of `article` or `excerpt`, safe marked snippets, and its appropriate reader/source navigation fields. Matching chunks collapse to one result per article, title matches receive more BM25 weight, and only current active article versions are indexed.

Queries are limited to 200 characters and ten prefix terms.

## Excerpts

### `GET /api/excerpt`

Returns owned excerpts in newest-first creation order, with a stable ID tie-breaker. The same order applies when filtering by `url` or `site_id` and when using the `search` parameter. Results support the common `page` and `page_size` parameters.

### `POST /api/excerpt`

`POST /api/excerpt` retains the legacy request fields and additionally accepts `canonicalUrl`. The server normalizes the page identity, links an owned article when an alias matches, and returns an optional `article: { id, title }`. Excerpts created before an article are linked when a later article save matches their stored normalized page key or URL.

## Common error codes

- `unauthorized`
- `invalid_json`, `invalid_request`, `invalid_pagination`
- `invalid_url`, `invalid_article`, `empty_article`, `article_too_large`
- `article_not_found`, `article_version_not_found`
- `article_alias_conflict`, `article_deleting`
- `concurrent_save`, `concurrent_restore`, `version_is_current`
- `article_content_unavailable`, `article_version_unavailable`
