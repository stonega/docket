"use client";
import { LoadMore } from "@/components/load-more";
import { useSites } from "@/hooks/use-api";
import { usePagination } from "@/hooks/use-pagination";
import { Site } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MagnifyingGlassIcon,
  DashboardIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import { useAtom } from "jotai";
import { menuAtom } from "@/store";

export default function Page() {
  const { records, setPage, isLoading, hasMore } =
    usePagination<Site>(useSites);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expand, setExpand] = useAtom(menuAtom);

  return (
    <main className="w-full md:w-[800px] m-auto mt-10 py-4 md:py-0 flex flex-col items-start justify-start">
      <div className="w-full px-4 md:px-0 mb-10 flex flex-row justify-between items-center space-x-2">
        <HamburgerMenuIcon
          className="md:hidden w-6 h-6 text-stone-500 dark:text-stone-200 cursor-pointer"
          onClick={() => setExpand(true)}
        ></HamburgerMenuIcon>
        <div className="relative w-full">
          <input
            className="w-full input"
            placeholder="Search your docs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-4 h-4 absolute right-2 top-3 text-stone-500 dark:text-stone-200" />
        </div>
        <DashboardIcon className="w-6 h-6 text-stone-500 dark:text-stone-200 cursor-pointer" />
      </div>
      <div className="w-full px-4 md:px-0 relative grid grid-cols-2 md:grid-cols-3 gap-4">
        {records &&
          records.map((record) => (
            <div
              key="record.id"
              className="h-40 bg-yellow-100 dark:bg-yellow-700 border-2 border-yellow-200 dark:border-yellow-800 relative p-2 hover:bg-yellow-200 dark:hover:bg-yellow-600 cursor-pointer flex flex-col after:w-[1.414rem] after:h-[1.414rem] after:bg-yellow-50 dark:after:bg-yellow-950 after:border-b-2 after:border-b-yellow-200 dark:after:border-b-yellow-800 after:absolute after:right-0 after:-top-[0.414rem] after:rotate-45 after:origin-bottom-right"
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
              <div className="h-20 text-lg font-semibold text-ellipsis overflow-hidden text-center dark:text-stone-300">
                {record.title}
              </div>
              {/* <div className="text-sm first-letter text-ellipsis overflow-hidden">
                {record.description}
              </div> */}
            </div>
          ))}
        {isLoading &&
          ["✨", "✨", "✨", "✨", "✨", "✨"].map((_, index) => (
            <>
              <div
                className="h-40 bg-yellow-100 dark:bg-yellow-700 border-2 border-yellow-200 dark:border-yellow-800 relative p-2 flex flex-col after:w-[1.414rem] after:h-[1.414rem] after:bg-yellow-50 dark:after:bg-yellow-950 after:border-b-2 after:border-b-yellow-200 dark:after:border-b-yellow-800 after:absolute after:right-0 after:-top-[0.414rem] after:rotate-45 after:origin-bottom-right"
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
