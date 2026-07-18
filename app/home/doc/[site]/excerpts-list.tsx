"use client";
import type { Prisma } from "@prisma/client";
import ExcerptItem from "./excerpt";
import LibraryState from "../../library-state";

function ExcerptsList({
  excerpts,
  siteUrl,
}: {
  excerpts: Array<Prisma.ExcerptGetPayload<{
    include: { article: { select: { id: true; title: true } } };
  }>>;
  siteUrl: string;
}) {
  return (
    <section className="library-enter library-enter-delay mt-10 grow">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-excerpts-700 dark:text-excerpts-300">
            Reading notes
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-stone-950 dark:text-white sm:text-2xl">
            Saved excerpts
          </h2>
          <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
            Highlights are shown in the order they were saved.
          </p>
        </div>
        {excerpts.length > 0 && (
          <span className="shrink-0 rounded-full border border-excerpts-200 bg-excerpts-50 px-2.5 py-1 text-xs tabular-nums text-excerpts-800 dark:border-excerpts-900 dark:bg-excerpts-950/40 dark:text-excerpts-200">
            {excerpts.length}
          </span>
        )}
      </div>

      {excerpts.length === 0 ? (
        <LibraryState
          variant="excerpts"
          title="No excerpts from this source yet"
          description="Highlight useful text with the Docket extension and it will be collected here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {excerpts.map((excerpt, index) => (
            <ExcerptItem
              excerpt={excerpt}
              key={excerpt.id}
              siteUrl={siteUrl}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ExcerptsList;
