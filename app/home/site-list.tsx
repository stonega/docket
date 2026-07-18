"use client";
import { usePagination } from "@/hooks/use-pagination";
import { Site } from "@prisma/client";
import Grid from "./grid";
import { LoadMore } from "@/components/load-more";
import SiteCard from "./site-card";
import LibraryState from "./library-state";

export default function SiteList() {
  const { records, setPage, isLoading, hasMore, error } =
    usePagination<Site>("/api/site");

  return (
    <div className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
            Saved sites
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Open a source to review its saved excerpts.
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
          title="Sites could not be loaded"
          description="Check your connection and refresh the page to try again."
        />
      ) : !isLoading && records.length === 0 ? (
        <LibraryState
          title="No sites saved yet"
          description="Save a documentation page with the Docket extension and it will appear here."
        />
      ) : (
        <div className="flex flex-col items-center">
          <Grid>
            {records.map((record, index) => (
              <SiteCard site={record} animationIndex={index} key={record.id} />
            ))}
            {isLoading &&
              records.length === 0 &&
              Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    aria-hidden="true"
                    className="min-h-56 animate-pulse overflow-hidden rounded-2xl border border-sites-200/80 bg-sites-50 p-5 dark:border-sites-900 dark:bg-[#261f1d] motion-reduce:animate-none"
                    key={`site-skeleton-${index}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="size-11 rounded-xl bg-sites-200 dark:bg-white/10" />
                      <div className="size-8 rounded-full bg-sites-200/80 dark:bg-white/10" />
                    </div>
                    <div className="mt-6 h-4 w-4/5 rounded-full bg-sites-200 dark:bg-white/10" />
                    <div className="mt-3 h-3 w-full rounded-full bg-sites-200/70 dark:bg-white/[0.07]" />
                    <div className="mt-2 h-3 w-2/3 rounded-full bg-sites-200/70 dark:bg-white/[0.07]" />
                  </div>
                ),
              )}
          </Grid>
          {error ? (
            <p
              className="mt-5 text-xs text-yellow-800 dark:text-yellow-300"
              role="alert"
            >
              More sites could not be loaded. Try again shortly.
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
