"use client";
import { Cross1Icon, DashboardIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { useRef, useState } from "react";
import { siteOneColumnLayoutAtom } from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useThrottleEffect } from "ahooks";
import queryString from "query-string";
import RowIcon from "@/components/row-icon";
import { useHotkeys } from "react-hotkeys-hook";

export default function SearchBar() {
  const router = useRouter();
  const [oneColumn, setOneColumn] = useAtom(siteOneColumnLayoutAtom);
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const ref = useRef(null);

  useHotkeys(
    "ctrl+k",
    () => {
      // @ts-ignore
      if (ref) ref.current!.focus();
    },
    { preventDefault: true }
  );

  useThrottleEffect(() => {
    router.push(pathname + "?" + queryString.stringify({ q: search }));
  }, [search]);

  return (
    <div className="w-full px-4 md:px-0 mb-10 flex flex-row justify-between items-center">
      <div className="relative w-full mr-2">
        <input
          className="w-full input"
          placeholder="Search your docs"
          value={search}
          ref={ref}
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
          <kbd className="h-6 text-center absolute right-2 top-0 bottom-0 my-auto px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
            Ctrl+k
          </kbd>
        )}
      </div>
      {oneColumn ? (
        <DashboardIcon
          className="w-6 h-6 text-stone-500 dark:text-stone-200 cursor-pointer"
          onClick={() => setOneColumn(false)}
        />
      ) : (
        <RowIcon
          className="w-6 h-6 text-stone-500 dark:text-stone-200 cursor-pointer"
          onClick={() => setOneColumn(true)}
        />
      )}
    </div>
  );
}
