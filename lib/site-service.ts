import type { DbClient } from "@/lib/prisma";
import { normalizeUrl } from "@/lib/articles";
import { getDocUrl } from "@/lib/utils";

export function getSiteUrlForPage(url: string) {
  const normalizedUrl = normalizeUrl(url);
  const source = new URL(normalizedUrl);
  return normalizeUrl(getDocUrl(normalizedUrl) ?? source.origin);
}

export async function findOwnedSiteForPage({
  db,
  userId,
  url,
}: {
  db: DbClient;
  userId: string;
  url: string;
}) {
  const source = new URL(normalizeUrl(url));
  const sites = await db.site.findMany({ where: { userId } });
  let bestMatch: { site: (typeof sites)[number]; specificity: number } | null = null;

  for (const site of sites) {
    try {
      const normalizedSite = new URL(normalizeUrl(site.url));
      const sitePath = normalizedSite.pathname === "/"
        ? "/"
        : `${normalizedSite.pathname}/`;
      const sourcePath = source.pathname === "/" ? "/" : `${source.pathname}/`;
      const matches = normalizedSite.origin === source.origin &&
        sourcePath.startsWith(sitePath);
      const specificity = normalizedSite.pathname.length;

      if (matches && (!bestMatch || specificity > bestMatch.specificity)) {
        bestMatch = { site, specificity };
      }
    } catch {
      // Ignore legacy rows that do not contain a valid HTTP(S) URL.
    }
  }

  return bestMatch?.site ?? null;
}
