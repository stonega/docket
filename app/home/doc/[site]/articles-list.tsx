"use client";

import { LoadMore } from "@/components/load-more";
import { usePagination } from "@/hooks/use-pagination";
import type { ArticleSummary } from "@/types/library";
import ArticleCard from "../../article-card";
import LibraryState from "../../library-state";

export default function ArticlesList({
  siteId,
  total,
}: {
  siteId: string;
  total: number;
}) {
  const { records, setPage, isLoading, hasMore, error } =
    usePagination<ArticleSummary>(`/api/article?site_id=${encodeURIComponent(siteId)}`);

  return (
    <section className="library-enter library-enter-delay mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
            Readable copies
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-stone-950 dark:text-white sm:text-2xl">
            Saved articles
          </h2>
          <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
            Current snapshots associated with this source.
          </p>
        </div>
        {total > 0 && (
          <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs tabular-nums text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {total}
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
          title="No articles from this source yet"
          description="Use “Save article to Docket” on a page from this site and its readable copy will appear here."
        />
      ) : (
        <div className="flex flex-col items-center">
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((article, index) => (
              <ArticleCard article={article} animationIndex={index} key={article.id} />
            ))}
            {isLoading &&
              records.length === 0 &&
              Array.from({ length: Math.min(total || 3, 3) })
                .map((_, index) => (
                  <div
                    aria-hidden="true"
                    className="min-h-72 animate-pulse border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-[#14231f] motion-reduce:animate-none"
                    key={`site-article-skeleton-${index}`}
                  />
                ))}
          </div>
          {error && records.length > 0 ? (
            <p className="mt-5 text-xs text-yellow-800 dark:text-yellow-300" role="alert">
              More articles could not be loaded. Try again shortly.
            </p>
          ) : records.length > 0 ? (
            <LoadMore isLoading={isLoading} hasMore={hasMore} setPage={setPage} />
          ) : null}
        </div>
      )}
    </section>
  );
}
