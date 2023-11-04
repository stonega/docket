"use client";
import { LoadMore } from "@/components/load-more";
import { useSites } from "@/hooks/use-api";
import { usePagination } from "@/hooks/use-pagination";
import { Site } from "@prisma/client";
import { useState } from "react";
import {
  MagnifyingGlassIcon,
  DashboardIcon,
  RowsIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import { useAtom } from "jotai";
import { menuAtom, siteOneColumnLayoutAtom } from "@/store";
import Link from "next/link";
import classnames from "classnames";
import { playfair } from "../fonts";
import SiteCard from "./site_card";

export default function Page() {
  const { records, setPage, isLoading, hasMore } =
    usePagination<Site>(useSites);
  const [search, setSearch] = useState("");
  const [expand, setExpand] = useAtom(menuAtom);
  const [oneColumn, setOneColumn] = useAtom(siteOneColumnLayoutAtom);

  return (
    <main className="w-full md:w-[800px] m-auto mt-0 md:mt-10 py-4 md:py-0 flex flex-col items-start justify-start">
      <div className="md:hidden px-4 mb-8 flex flex-row space-x-2 items-center mr-10">
        <Image
          alt="Docket"
          src="/docket.png"
          unoptimized
          width={40}
          height={22}
        />
        <Link
          href="/"
          className={classnames(
            "text-3xl font-semibold font-serif dark:text-white",
            playfair.className
          )}
        >
          Docket
        </Link>
      </div>
      <div className="w-full px-4 md:px-0 mb-10 flex flex-row justify-between items-center">
        <HamburgerMenuIcon
          className="md:hidden w-6 h-6 text-stone-500 dark:text-stone-200 cursor-pointer"
          onClick={() => setExpand(true)}
        ></HamburgerMenuIcon>
        <div className="relative w-full mr-2 ml-2 md:ml-0">
          <input
            className="w-full input"
            placeholder="Search your docs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-4 h-4 absolute right-2 top-3 text-stone-500 dark:text-stone-200" />
        </div>
        {oneColumn ? (
          <DashboardIcon
            className="w-6 h-6 text-stone-500 dark:text-stone-200 cursor-pointer"
            onClick={() => setOneColumn(false)}
          />
        ) : (
          <RowsIcon
            className="w-6 h-6 text-stone-500 dark:text-stone-200 cursor-pointer"
            onClick={() => setOneColumn(true)}
          />
        )}
      </div>
      <div
        className={classnames("w-full px-4 md:px-0 relative grid gap-4", {
          "grid-cols-1": oneColumn,
          "grid-cols-2 md:grid-cols-3": !oneColumn,
        })}
      >
        {records &&
          records.map((record) => <SiteCard site={record} key={record.id} />)}
        {isLoading &&
          ["✨", "✨", "✨", "✨", "✨", "✨"].map((_, index) => (
            <>
              <div
                className={classnames(
                  "bg-yellow-100 dark:bg-yellow-700 border-2 border-yellow-200 dark:border-yellow-800 relative p-2 flex after:w-[1.414rem] after:h-[1.414rem] after:bg-yellow-50 dark:after:bg-yellow-950 after:border-b-2 after:border-b-yellow-200 dark:after:border-b-yellow-800 after:absolute after:right-0 after:-top-[0.414rem] after:rotate-45 after:origin-bottom-right",
                  {
                    "h-20 flex-row": oneColumn,
                    "h-40 flex-col": !oneColumn,
                  }
                )}
                key={index}
              >
                <div
                  className={classnames("flex animate-pulse items-center", {
                    "flex-row w-full": oneColumn,
                    "flex-col": !oneColumn,
                  })}
                >
                  <div
                    className={classnames(
                      "h-10 w-10 rounded-full bg-black/50",
                      {
                        "mx-4 my-auto": oneColumn,
                        "mt-2": !oneColumn,
                      }
                    )}
                  ></div>
                  <div
                    className={classnames(
                      "h-4 w-[80%] rounded-md bg-black/50",
                      {
                        "mx-4 w-[50%]": oneColumn,
                        "mt-5 w-[80%]": !oneColumn,
                      }
                    )}
                  ></div>
                  <div
                    className={classnames(
                      "mt-2 h-4 w-[40%] rounded-md bg-black/50",
                      {
                        hidden: oneColumn,
                        block: !oneColumn,
                      }
                    )}
                  ></div>
                </div>
              </div>
            </>
          ))}
      </div>
      <LoadMore isLoading={isLoading} hasMore={hasMore} setPage={setPage} />
    </main>
  );
}
