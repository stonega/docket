"use client";
import { LoadMore } from "@/components/load-more";
import { useExcerpts } from "@/hooks/use-api";
import { usePagination } from "@/hooks/use-pagination";
import { dateFromNow } from "@/lib/utils";
import { Excerpt } from "@prisma/client";
import parse from 'html-react-parser';

const ExcerptsList = ({ siteId }: { siteId: string }) => {
  const { records, setPage, isLoading, hasMore } = usePagination<Excerpt>(
    useExcerpts,
    { siteId }
  );

  return (
    <div className="flex flex-col space-y-4">
      {records &&
        records.map((excerpt) => (
          <div className="py-2 flex flex-col space-y-2" key={excerpt.id}>
            <article className="prose prose-stone lg:prose-xl dark:prose-invert">{parse(excerpt.content)}</article>
            <div className="flex flex-row text-gray-600 dark:text-gray-200 text-sm">
              <span>{dateFromNow(excerpt.createAt.toString())}</span>
              <a href={excerpt.url} target="_black" className="ml-4">
                Source
              </a>
            </div>
          </div>
        ))}
      {isLoading && (
        <>
          <div className="flex animate-pulse flex-col space-y-2">
            <div className="mt-2 h-4 w-[20%] rounded-md bg-black/50"></div>
            <div className="text-md mt-2 h-4 w-full rounded-md bg-black/50"></div>
            <div className="mt-2 h-4 w-[60%] rounded-md bg-black/50"></div>
            <div className="mt-2 h-4 w-[30%] rounded-md bg-black/50"></div>
          </div>
        </>
      )}
      <LoadMore isLoading={isLoading} hasMore={hasMore} setPage={setPage} />
    </div>
  );
};

export default ExcerptsList;
