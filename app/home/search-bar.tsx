"use client";

import {
  Cross1Icon,
  DashboardIcon,
  HamburgerMenuIcon,
  MagnifyingGlassIcon,
  RowsIcon,
} from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { useState } from "react";
import { menuAtom, siteOneColumnLayoutAtom } from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useThrottleEffect } from "ahooks";
import queryString from "query-string";
import RowIcon from "@/components/row-icon";
export default function SearchBar() {
  const router = useRouter();
  const [, setExpand] = useAtom(menuAtom);
  const [oneColumn, setOneColumn] = useAtom(siteOneColumnLayoutAtom);
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useThrottleEffect(() => {
    router.push(pathname + "?" + queryString.stringify({ q: search }));
  }, [search]);

  return (
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
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        {search ? (
          <Cross1Icon
            className="w-4 h-4 absolute right-2 my-auto text-stone-500 top-0 bottom-0 dark:text-stone-200 cursor-pointer"
            onClick={() => {
              setSearch("");
            }}
          />
        ) : (
          <MagnifyingGlassIcon className="w-4 h-4 absolute right-2 my-auto top-0 bottom-0 text-stone-500 dark:text-stone-200 cursor-pointer" />
        )}
      </div>
      {oneColumn ? (
        <DashboardIcon
          className="w-6 h-6 text-stone-500 dark:text-stone-200 cursor-pointer"
          onClick={() => setOneColumn(false)}
        />
      ) : (
        <RowIcon
          className="w-6 h-6 text-stone-500 p-[0.15rem] dark:text-stone-200 cursor-pointer"
          onClick={() => setOneColumn(true)}
        />
      )}
    </div>
  );
}
