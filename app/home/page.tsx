"use client";
import { LoadMore } from "@/components/load-more";
import { useSites } from "@/hooks/use-api";
import { usePagination } from "@/hooks/use-pagination";
import { Site } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlassIcon, DashboardIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export default function Page() {
  const { records, setPage, isLoading, hasMore } =
    usePagination<Site>(useSites);
  const router = useRouter();
  const [search, setSearch] = useState("");

  return (
    <main className="w-[800px] m-auto mt-10 flex flex-col items-start justify-start">
      <div className="w-full mb-10 flex flex-row justify-between items-center">
        <div className="relative">
          <input
            className="input"
            placeholder="Search your docs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-4 h-4 absolute right-2 top-4" />
        </div>
        {/* <DashboardIcon className="w-6 h-6 text-gray-500" /> */}
      </div>
      <div className="relative w-full grid grid-cols-3 gap-4">
        {records &&
          records.map((record) => (
            <div
              key="record.id"
              className="h-40 bg-yellow-100 border-2 border-yellow-200 relative p-2 hover:bg-yellow-200 cursor-pointer flex flex-col after:w-[1.414rem] after:h-[1.414rem] after:bg-yellow-50 dark:after:bg-yellow-950 after:border-b-2 after:border-b-yellow-200 after:absolute after:right-0 after:-top-[0.414rem] after:rotate-45 after:origin-bottom-right"
              onClick={() => router.push(`/home/doc/${record.id}`)}
            >
              <Image
                alt={record.title}
                src={
                  record.icon || `https://avatar.tobi.sh/${record.title}.png`
                }
                unoptimized
                width={35}
                height={35}
                className="m-auto"
              />
              <div className="h-20 text-lg font-semibold text-ellipsis overflow-hidden text-center">
                {record.title}
              </div>
              {/* <div className="text-sm first-letter text-ellipsis overflow-hidden">
                {record.description}
              </div> */}
            </div>
          ))}
        {isLoading &&
          ["✨", "✨", "✨"].map((_, index) => (
            <>
              <div
                className="h-40 bg-yellow-100 border-2 border-yellow-200 relative p-2 flex flex-col after:w-[1.414rem] after:h-[1.414rem] after:bg-yellow-50 dark:after:bg-yellow-950 after:border-b-2 after:border-b-yellow-200 after:absolute after:right-0 after:-top-[0.414rem] after:rotate-45 after:origin-bottom-right"
                key={index}
              >
                <div className="flex animate-pulse flex-col items-center">
                  <div className="mt-2 h-10 w-10 rounded-full bg-black/50"></div>
                  <div className="mt-5 h-4 w-[80%] rounded-md bg-black/50"></div>
                  <div className="mt-2 h-4 w-[40%] rounded-md bg-black/50"></div>
                </div>
              </div>
            </>
          ))}
      </div>
      <LoadMore isLoading={isLoading} hasMore={hasMore} setPage={setPage} />
    </main>
  );
}
