"use client";

import type { ArticleVersionSummary } from "@/types/library";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useState } from "react";
import { dateFromNow } from "@/lib/utils";

const PAGE_SIZE = 20;

function mergeVersions(
  versions: ArticleVersionSummary[],
  additions: ArticleVersionSummary[],
) {
  const byId = new Map(versions.map((version) => [version.id, version]));
  for (const version of additions) byId.set(version.id, version);
  return Array.from(byId.values()).sort(
    (left, right) => Date.parse(right.savedAt) - Date.parse(left.savedAt) ||
      right.id.localeCompare(left.id),
  );
}

export default function VersionHistory({
  articleId,
  selectedVersion,
  initialVersions,
  total,
}: {
  articleId: string;
  selectedVersion: ArticleVersionSummary;
  initialVersions: ArticleVersionSummary[];
  total: number;
}) {
  const [versions, setVersions] = useState(() =>
    mergeVersions(initialVersions, [selectedVersion]),
  );
  const [nextPage, setNextPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialVersions.length < total);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadMore() {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(
        `/api/article/${articleId}/versions?page=${nextPage}&page_size=${PAGE_SIZE}`,
      );
      if (!response.ok) throw new Error("Version history could not be loaded");
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid version history response");
      const additions = data as ArticleVersionSummary[];
      setVersions((current) => mergeVersions(current, additions));
      setNextPage((page) => page + 1);
      setHasMore(additions.length === PAGE_SIZE && nextPage * PAGE_SIZE < total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="library-enter library-enter-delay rounded-2xl border border-stone-200 bg-white/85 p-4 shadow-[0_8px_30px_rgba(28,25,23,0.04)] dark:border-white/10 dark:bg-white/[0.045] lg:sticky lg:top-[116px]">
      <div className="flex items-center justify-between gap-3 px-2 pb-3">
        <h2 className="text-sm font-semibold">Version history</h2>
        <span className="text-xs tabular-nums text-stone-500 dark:text-stone-400">
          {total}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {versions.map((version) => (
          <Link
            key={version.id}
            href={version.isCurrent
              ? `/home/article/${articleId}`
              : `/home/article/${articleId}?version=${version.id}`}
            aria-current={version.id === selectedVersion.id ? "page" : undefined}
            className={`rounded-xl border px-3 py-3 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-emerald-400 motion-reduce:transition-none ${
              version.id === selectedVersion.id
                ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                : "border-transparent hover:border-stone-200 hover:bg-stone-50 dark:hover:border-white/10 dark:hover:bg-white/[0.04]"
            }`}
          >
            <span className="flex items-center justify-between gap-2 text-xs font-medium">
              <span>{dateFromNow(version.savedAt)}</span>
              {version.isCurrent && (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <CheckCircledIcon className="size-3.5" /> Current
                </span>
              )}
            </span>
            <span className="mt-1 block truncate text-[0.6875rem] text-stone-500 dark:text-stone-400">
              {version.restoredFromVersionId
                ? "Restored snapshot"
                : version.contentHash.slice(0, 10)}
            </span>
          </Link>
        ))}
      </div>
      {error && (
        <p className="px-2 pt-3 text-xs text-red-700 dark:text-red-300" role="alert">
          More versions could not be loaded.
        </p>
      )}
      {hasMore && (
        <button
          type="button"
          className="mt-3 min-h-9 w-full rounded-xl border border-stone-200 px-3 text-xs font-medium text-stone-600 outline-none transition-colors duration-150 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/[0.05] motion-reduce:transition-none"
          disabled={loading}
          onClick={() => void loadMore()}
        >
          {loading ? "Loading…" : error ? "Try again" : "Load older versions"}
        </button>
      )}
    </aside>
  );
}
