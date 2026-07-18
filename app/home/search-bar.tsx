"use client";
import { Cross1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useThrottleEffect } from "ahooks";
import { useHotkeys } from "react-hotkeys-hook";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  useHotkeys(
    "ctrl+k, meta+k",
    () => {
      ref.current?.focus();
    },
    { preventDefault: true, enableOnFormTags: true },
  );

  useThrottleEffect(
    () => {
      const params = new URLSearchParams(searchParams.toString());
      const query = search.trim();

      if (query) params.set("q", query);
      else params.delete("q");

      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [search],
    { wait: 300 },
  );

  return (
    <div className="library-motion group/search relative w-full sm:max-w-sm">
      <MagnifyingGlassIcon
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400 transition-colors duration-150 group-focus-within/search:text-stone-700 dark:group-focus-within/search:text-stone-200"
      />
      <input
        className="h-10 w-full rounded-xl border border-transparent bg-stone-100/90 py-2 pl-9 pr-16 text-sm text-stone-950 outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out placeholder:text-stone-400 hover:bg-stone-100 focus:border-yellow-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(253,224,71,0.18)] dark:bg-white/[0.06] dark:text-white dark:placeholder:text-stone-500 dark:hover:bg-white/[0.08] dark:focus:border-yellow-700 dark:focus:bg-white/[0.08] motion-reduce:transition-none"
        placeholder="Search articles and excerpts"
        aria-label="Search articles and excerpts"
        value={search}
        ref={ref}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
      />
      {search ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 transition-colors duration-150 hover:bg-white hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:hover:bg-white/10 dark:hover:text-white motion-reduce:transition-none"
          onClick={() => {
            setSearch("");
            ref.current?.focus();
          }}
        >
          <Cross1Icon className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-stone-200 bg-white px-1.5 py-1 text-[0.625rem] font-medium leading-none text-stone-500 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-stone-400">
          Ctrl K
        </kbd>
      )}
    </div>
  );
}
