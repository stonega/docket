# Site URL deduplication

Docket resolves both excerpt and article saves through the same site lookup.
Site URLs are normalized before creation, including the trailing slash on an
origin-only URL such as `https://example.com/`.

Migration `0005_deduplicate_site_urls.sql`:

1. Canonicalizes legacy origin-only site URLs.
2. Reassigns excerpts and articles from duplicate rows to the most recently
   updated site.
3. Deletes the redundant rows.
4. Adds a unique index on `(user_id, url)`.

The application still performs a lookup before creating a site so nested
documentation paths resolve to the most specific saved site. The unique index
is the final guard for concurrent excerpt and article saves. A site creation
that loses that race reloads and returns the winning row.
