"use client";

import { dateFromNow } from "@/lib/utils";
import type { ArticleVersionSummary } from "@/types/library";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

const PAGE_SIZE = 100;

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

function versionLabel(version: ArticleVersionSummary) {
  if (version.isCurrent) return `Current · ${dateFromNow(version.savedAt)}`;
  const action = version.restoredFromVersionId ? "Restored" : "Saved";
  return `${action} ${dateFromNow(version.savedAt)}`;
}

export default function VersionSelector({
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
  const router = useRouter();
  const initialOptions = useMemo(
    () => mergeVersions(initialVersions, [selectedVersion]),
    [initialVersions, selectedVersion],
  );
  const [versions, setVersions] = useState(initialOptions);
  const [value, setValue] = useState(selectedVersion.id);
  const [loading, setLoading] = useState(initialOptions.length < total);
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setVersions((current) => mergeVersions(current, initialOptions));
    setValue(selectedVersion.id);
  }, [initialOptions, selectedVersion.id]);

  useEffect(() => {
    if (initialOptions.length >= total) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadVersions() {
      setLoading(true);
      setError(false);
      try {
        const additions: ArticleVersionSummary[] = [];
        const pageCount = Math.ceil(total / PAGE_SIZE);

        for (let page = 1; page <= pageCount; page += 1) {
          const response = await fetch(
            `/api/article/${articleId}/versions?page=${page}&page_size=${PAGE_SIZE}`,
            { signal: controller.signal },
          );
          if (!response.ok) throw new Error("Version history could not be loaded");
          const data: unknown = await response.json();
          if (!Array.isArray(data)) throw new Error("Invalid version history response");
          additions.push(...(data as ArticleVersionSummary[]));
          if (data.length < PAGE_SIZE) break;
        }

        setVersions((current) => mergeVersions(current, additions));
      } catch (loadError) {
        if (!(loadError instanceof Error && loadError.name === "AbortError")) {
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadVersions();
    return () => controller.abort();
  }, [articleId, initialOptions.length, total]);

  function selectVersion(versionId: string) {
    setValue(versionId);
    const version = versions.find((option) => option.id === versionId);
    if (!version || version.id === selectedVersion.id) return;

    const href = version.isCurrent
      ? `/home/article/${articleId}`
      : `/home/article/${articleId}?version=${encodeURIComponent(version.id)}`;
    startTransition(() => router.push(href));
  }

  return (
    <>
      <select
        aria-busy={loading || isPending}
        aria-label="Article version"
        className="h-9 max-w-40 rounded-xl border border-stone-200 bg-white/70 px-3 text-xs font-medium text-stone-700 outline-none transition-colors duration-150 hover:bg-white focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:bg-white/[0.06] dark:text-stone-200 dark:hover:bg-white/10 sm:max-w-56"
        disabled={isPending}
        onChange={(event) => selectVersion(event.target.value)}
        value={value}
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            {versionLabel(version)}
          </option>
        ))}
        {loading && (
          <option disabled value="">
            Loading older versions…
          </option>
        )}
      </select>
      {error && (
        <span className="sr-only" role="alert">
          Older versions could not be loaded.
        </span>
      )}
    </>
  );
}
