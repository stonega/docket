"use client";
import { LoadMore } from "@/components/load-more";
import { useExcerpts } from "@/hooks/use-api";
import { usePagination } from "@/hooks/use-pagination";
import { Excerpt } from "@prisma/client";
import { useState } from "react";

export default function Page({ params }: { params: { site: string } }) {
  const siteId = params.site;
  const { records, setPage, isLoading, hasMore } = usePagination<Excerpt>(
    useExcerpts,
    { siteId }
  );

  return (
    <div className="w-[800px] m-auto flex flex-col h-full space-y-2 dark:text-white">
      {records &&
        records.map((excerpt) => (
          <div className="border-0 border-orange-200 p-2" key={excerpt.id}>
            {excerpt.content}
          </div>
        ))}
      <LoadMore isLoading={isLoading} hasMore={hasMore} setPage={setPage} />
    </div>
  );
}
