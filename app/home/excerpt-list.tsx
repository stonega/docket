"use client";
import { usePagination } from "@/hooks/use-pagination";
import type { ExcerptWithArticle } from "@/types/library";
import { LoadMore } from "@/components/load-more";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import ExcerptPreview from "./excerpt-preview";
import LibraryState from "./library-state";

export default function ExcerptList() {
  const { records, setPage, isLoading, hasMore, error } =
    usePagination<ExcerptWithArticle>("/api/excerpt");

  return (
    <div className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
            Saved excerpts
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            The ideas and details you chose to keep.
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
          title="Excerpts could not be loaded"
          description="Check your connection and refresh the page to try again."
        />
      ) : !isLoading && records.length === 0 ? (
        <LibraryState
          variant="excerpts"
          title="No excerpts saved yet"
          description="Highlight useful text with the Docket extension and your collection will grow here."
        />
      ) : (
        <div className="flex flex-col items-center">
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 0: 1, 720: 2, 1080: 3 }}
            className="w-full"
          >
            <Masonry gutter="16px">
              {records.map((record, index) => (
                <ExcerptPreview
                  excerpt={record}
                  animationIndex={index}
                  key={record.id}
                />
              ))}
              {isLoading &&
                records.length === 0 &&
                Array.from({ length: 6 }).map(
                  (_, index) => (
                    <div
                      aria-hidden="true"
                      className="min-h-48 animate-pulse rounded-2xl border border-excerpts-200/90 bg-excerpts-50 p-5 dark:border-excerpts-900 dark:bg-[#241d25] motion-reduce:animate-none"
                      key={`excerpt-skeleton-${index}`}
                    >
                      <div className="h-2 w-16 rounded-full bg-excerpts-200 dark:bg-white/10" />
                      <div className="mt-6 h-3 w-full rounded-full bg-excerpts-200/80 dark:bg-white/10" />
                      <div className="mt-3 h-3 w-5/6 rounded-full bg-excerpts-200/80 dark:bg-white/10" />
                      <div className="mt-3 h-3 w-2/3 rounded-full bg-excerpts-200/80 dark:bg-white/10" />
                      <div className="mt-10 h-3 w-1/3 rounded-full bg-excerpts-200/60 dark:bg-white/[0.07]" />
                    </div>
                  ),
                )}
            </Masonry>
          </ResponsiveMasonry>
          {error ? (
            <p
              className="mt-5 text-xs text-yellow-800 dark:text-yellow-300"
              role="alert"
            >
              More excerpts could not be loaded. Try again shortly.
            </p>
          ) : records.length > 0 ? (
            <LoadMore
              isLoading={isLoading}
              hasMore={hasMore}
              setPage={setPage}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
