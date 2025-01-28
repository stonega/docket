"use client";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useThrottleEffect } from "ahooks";
import queryString from "query-string";
import { useHotkeys } from "react-hotkeys-hook";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const ref = useRef(null);

  useHotkeys(
    "ctrl+k",
    () => {
      // @ts-expect-error type error
      if (ref) ref.current!.focus();
    },
    { preventDefault: true }
  );

  useThrottleEffect(() => {
    router.push(pathname + "?" + queryString.stringify({ q: search }));
  }, [search]);

  return (
    <div className="sticky top-[62px] bg-[#ffc900] dark:bg-[#302a30] w-full py-12 mb-4 border-b border-black dark:border-white">
      <div className="relative container mx-auto px-6">
        <input
          className="w-full input"
          placeholder="Search your docket"
          value={search}
          ref={ref}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        {search ? (
          <Cross1Icon
            className="w-4 h-4 absolute right-2 my-auto text-black top-0 bottom-0 dark:text-white cursor-pointer"
            onClick={() => {
              setSearch("");
            }}
          />
        ) : (
          <kbd className="h-6 text-center absolute md:right-8 right-4 top-0 bottom-0 my-auto px-2 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
            Ctrl+k
          </kbd>
        )}
      </div>
    </div>
  );
}
