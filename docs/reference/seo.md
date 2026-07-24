# Search and Social Metadata

Docket's canonical production origin is `https://docket.space`.

The root layout defines shared title, description, icon, manifest, crawler, Open Graph, and Twitter metadata. Public pages add their own canonical URL, and the privacy page overrides the shared social metadata with page-specific copy.

Only public pages belong in `app/sitemap.ts`:

- `/`
- `/privacy`

Authenticated, authentication, API, and extension-connection routes are excluded from `app/robots.ts`. Page metadata also marks user-specific and utility routes as `noindex` so they do not appear in search results if a crawler reaches them.

Clerk middleware must keep `/robots.txt` and `/sitemap.xml` public so crawlers can fetch the generated files without a session.

Keep `lib/seo.ts`, `app/robots.ts`, `app/sitemap.ts`, `middleware.ts`, and `public/site.webmanifest` aligned when the product name, description, public routes, or production origin changes.
