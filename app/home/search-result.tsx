"use client";
import ExcerptCard from "@/components/excerpt-card";
import { LoadMore } from "@/components/load-more";
import Tooltip from "@/components/tooltip";
import { usePagination } from "@/hooks/use-pagination";
import { dateFromNow, formateDate } from "@/lib/utils";
import { Excerpt } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SearchResult() {
  const searchParams = useSearchParams();
  const { records, setPage, isLoading, hasMore, setOptions } =
    usePagination<Excerpt>("/api/excerpt");
  useEffect(() => {
    setOptions({
      search: searchParams.get("q") ?? "",
    });
  }, [searchParams, setOptions]);
  return (
    <div className="md:w-[800px] m-auto flex flex-col w-full">
      <h1 className="dark:text-white">
        Search Result for {searchParams.get("q")}
      </h1>
      {records.map((excerpt) => (
        <div className="py-2" key={excerpt.id}>
          <ExcerptCard excerpt={excerpt} />
          <div className="mt-2 flex flex-row text-stone-600 dark:text-stone-200 text-sm md:space-x-4">
            <Tooltip content={excerpt.url}>
              <a
                href={excerpt.url}
                target="_black"
                className="decoration-solid underline"
              >
                {excerpt.url}
              </a>
            </Tooltip>
            <Tooltip content={formateDate(excerpt.createAt.toString())}>
              <span>{dateFromNow(excerpt.createAt.toString())}</span>
            </Tooltip>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex animate-pulse flex-col space-y-2">
          <div className="mt-2 h-4 w-[20%] rounded-md bg-black/50"></div>
          <div className="text-md mt-2 h-4 w-full rounded-md bg-black/50"></div>
          <div className="mt-2 h-4 w-[60%] rounded-md bg-black/50"></div>
          <div className="mt-2 h-4 w-[30%] rounded-md bg-black/50"></div>
        </div>
      )}
      <LoadMore
        isLoading={isLoading}
        hasMore={hasMore}
        setPage={setPage}
        empty={records.length === 0}
      />
    </div>
  );
}
