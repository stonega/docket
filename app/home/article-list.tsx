"use client";

import { LoadMore } from "@/components/load-more";
import { usePagination } from "@/hooks/use-pagination";
import type { ArticleSummary } from "@/types/library";
import ArticleCard from "./article-card";
import Grid from "./grid";
import LibraryState from "./library-state";

export default function ArticleList() {
  const { records, setPage, isLoading, hasMore, error } =
    usePagination<ArticleSummary>("/api/article");

  return (
    <div className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
            Saved articles
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Readable snapshots and their complete version history.
          </p>
        </div>
        {records.length > 0 && (
          <span className="shrink-0 text-xs tabular-nums text-stone-500 dark:text-stone-400">
            {records.length} loaded
          </span>
        )}
      </div>

      {error && records.length === 0 ? (
        <LibraryState
          variant="error"
          title="Articles could not be loaded"
          description="Check your connection and refresh the page to try again."
        />
      ) : !isLoading && records.length === 0 ? (
        <LibraryState
          variant="articles"
          title="No articles saved yet"
          description="Use “Save article to Docket” on an HTTPS page and its readable copy will appear here."
        />
      ) : (
        <div className="flex flex-col items-center">
          <Grid>
            {records.map((article, index) => (
              <ArticleCard article={article} animationIndex={index} key={article.id} />
            ))}
            {isLoading &&
              records.length === 0 &&
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  aria-hidden="true"
                  className="min-h-72 animate-pulse overflow-hidden border border-emerald-200/80 bg-emerald-50 dark:border-emerald-900 dark:bg-[#14231f] motion-reduce:animate-none"
                  key={`article-skeleton-${index}`}
                >
                  <div className="aspect-[16/8] bg-emerald-100 dark:bg-white/[0.06]" />
                  <div className="p-5">
                    <div className="h-4 w-5/6 rounded-full bg-emerald-200 dark:bg-white/10" />
                    <div className="mt-3 h-3 w-1/2 rounded-full bg-emerald-200/70 dark:bg-white/[0.07]" />
                  </div>
                </div>
              ))}
          </Grid>
          {error ? (
            <p className="mt-5 text-xs text-yellow-800 dark:text-yellow-300" role="alert">
              More articles could not be loaded. Try again shortly.
            </p>
          ) : records.length > 0 ? (
            <LoadMore isLoading={isLoading} hasMore={hasMore} setPage={setPage} />
          ) : null}
        </div>
      )}
    </div>
  );
}
