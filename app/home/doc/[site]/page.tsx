"use client";
import { LoadMore } from "@/components/load-more";
import { useExcerpts } from "@/hooks/use-api";
import { usePagination } from "@/hooks/use-pagination";
import { dateFromNow } from "@/lib/utils";
import { Excerpt } from "@prisma/client";
import { useState } from "react";

export default function Page({ params }: { params: { site: string } }) {
  const siteId = params.site;
  const { records, setPage, isLoading, hasMore } = usePagination<Excerpt>(
    useExcerpts,
    { siteId }
  );

  return (
    <div className="mt-20 w-[800px] mx-auto flex flex-col h-full space-y-2 dark:text-white">
      {records &&
        records.map((excerpt) => (
          <div className="p-2 flex flex-col" key={excerpt.id}>
            <span>{excerpt.content}</span>
            <div className="flex flex-row text-gray-600 dark:text-gray-200 text-sm">
              <div>
                {dateFromNow(excerpt.createAt.toString())}
              </div>
              <a href={excerpt.url} target="_black" className="ml-4">Origin</a>
            </div>
          </div>
        ))}
      <LoadMore isLoading={isLoading} hasMore={hasMore} setPage={setPage} />
    </div>
  );
}
