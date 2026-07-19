"use client";

import { LoadMore } from "@/components/load-more";
import { usePagination } from "@/hooks/use-pagination";
import type { LibrarySearchResult } from "@/types/library";
import { ArrowRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LibraryState from "./library-state";

function HighlightedText({ value }: { value: string }) {
  const parts = value.split(/(<mark>|<\/mark>)/g);
  let highlighted = false;
  return (
    <>
      {parts.map((part, index) => {
        if (part === "<mark>") {
          highlighted = true;
          return null;
        }
        if (part === "</mark>") {
          highlighted = false;
          return null;
        }
        return highlighted ? (
          <mark
            className="rounded-sm bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-800"
            key={`${part}-${index}`}
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        );
      })}
    </>
  );
}

function SearchCard({ result, index }: { result: LibrarySearchResult; index: number }) {
  const isArticle = result.kind === "article";
  const destination = isArticle
    ? `/home/article/${result.id}`
    : result.article
      ? `/home/article/${result.article.id}`
      : result.sourceUrl;

  return (
    <article
      className={`library-card-enter overflow-hidden border bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04)] ${
        isArticle
          ? "border-emerald-200 dark:border-emerald-900 dark:bg-[#14231f]"
          : "border-excerpts-200 dark:border-excerpts-900 dark:bg-[#241d25]"
      }`}
      style={{ animationDelay: `${Math.min(index, 8) * 32}ms` }}
    >
      <Link
        href={destination}
        target={!isArticle && !result.article ? "_blank" : undefined}
        rel={!isArticle && !result.article ? "noreferrer" : undefined}
        className="block p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400"
      >
        <div className="flex items-center justify-between gap-4">
          <span
            className={`text-[0.625rem] font-semibold uppercase tracking-[0.16em] ${
              isArticle
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-excerpts-700 dark:text-excerpts-300"
            }`}
          >
            {isArticle ? "Article" : "Excerpt"}
          </span>
          <ArrowRightIcon className="size-4 text-stone-400" />
        </div>
        <h3 className="mt-4 text-base font-semibold leading-6 tracking-[-0.01em] text-stone-950 dark:text-white">
          <HighlightedText value={result.titleSnippet || result.title} />
        </h3>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
          <HighlightedText value={result.snippet} />
        </p>
        <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">
          {isArticle
            ? `${result.siteTitle} · ${result.wordCount.toLocaleString()} words`
            : result.article
              ? `From ${result.article.title}`
              : "Original source"}
        </p>
      </Link>
      <a
        href={result.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-11 items-center justify-between border-t border-stone-200/80 px-5 py-3 text-xs text-stone-500 outline-none transition-colors duration-150 hover:bg-stone-50 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/[0.04] dark:hover:text-white motion-reduce:transition-none"
      >
        <span>Open original</span>
        <ExternalLinkIcon className="size-3.5" />
      </a>
    </article>
  );
}

export default function SearchResult() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const path = `/api/search?q=${encodeURIComponent(query)}`;
  const { records, setPage, isLoading, hasMore, error } =
    usePagination<LibrarySearchResult>(path);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
            Library matches
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Titles are weighted above article and excerpt text.
          </p>
        </div>
        {!isLoading && !error && (
          <span className="shrink-0 text-xs tabular-nums text-stone-500 dark:text-stone-400">
            {records.length} {records.length === 1 ? "match" : "matches"}
            {hasMore ? " loaded" : ""}
          </span>
        )}
      </div>

      {error && records.length === 0 ? (
        <LibraryState
          variant="error"
          title="Search is unavailable"
          description="The library index could not be searched. Refresh the page and try again."
        />
      ) : !isLoading && records.length === 0 ? (
        <LibraryState
          variant="search"
          title="No library matches"
          description={`Try a shorter or more general phrase than “${query}”.`}
        />
      ) : (
        <div className="flex flex-col items-center">
          <div className="grid w-full items-start gap-4 lg:grid-cols-2">
            {records.map((result, index) => (
              <SearchCard result={result} index={index} key={`${result.kind}:${result.id}`} />
            ))}
            {isLoading &&
              Array.from({ length: records.length === 0 ? 4 : 2 }).map((_, index) => (
                <div
                  aria-hidden="true"
                  className="min-h-52 animate-pulse border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] motion-reduce:animate-none"
                  key={`search-skeleton-${index}`}
                >
                  <div className="h-2 w-16 rounded-full bg-stone-200 dark:bg-white/10" />
                  <div className="mt-6 h-4 w-4/5 rounded-full bg-stone-200 dark:bg-white/10" />
                  <div className="mt-4 h-3 w-full rounded-full bg-stone-200/80 dark:bg-white/[0.07]" />
                  <div className="mt-3 h-3 w-2/3 rounded-full bg-stone-200/80 dark:bg-white/[0.07]" />
                </div>
              ))}
          </div>
          {error ? (
            <p className="mt-5 text-xs text-yellow-800 dark:text-yellow-300" role="alert">
              More results could not be loaded. Try again shortly.
            </p>
          ) : records.length > 0 ? (
            <LoadMore isLoading={isLoading} hasMore={hasMore} setPage={setPage} />
          ) : null}
        </div>
      )}
    </div>
  );
}
