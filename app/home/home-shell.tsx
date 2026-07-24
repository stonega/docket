"use client";

import {
  Cross1Icon,
  GearIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import ThemeModeButton from "../../components/theme-mode-button";
import { fraunces } from "../fonts";
import classnames from "classnames";
import { UserButton } from "@clerk/nextjs";
import { menuAtom } from "@/store";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/logo";

export default function HomeShell({ children }: { children: React.ReactNode }) {
  const [expand, setExpand] = useAtom(menuAtom);
  const pathname = usePathname();

  useEffect(() => {
    setExpand(false);
  }, [pathname, setExpand]);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-20 bg-white dark:bg-[#0a2328] h-2 w-full" />
      <div className="sticky top-2 z-20 bg-white dark:bg-[#0a2328] w-full flex justify-between border-y border-stone-400 dark:border-stone-600">
        <div className="inline-flex items-center">
          <Link
            href="/"
            className={classnames(
              "inline-flex text-2xl font-semibold text-black dark:text-white border-e border-stone-400 dark:border-stone-600",
              fraunces.className,
            )}
          >
            <Logo className="p-1 w-8 border-e border-stone-400 dark:border-stone-600" />
            <span className="p-1">Docket</span>
          </Link>
        </div>
        <div className="flex items-center justify-end">
          <div className="h-full flex items-center border-l border-stone-400 dark:border-stone-600 px-4">
            <ThemeModeButton />
          </div>
          <div className="h-full flex justify-end items-center border-s border-stone-400 dark:border-stone-600 px-4">
            <UserButton />
          </div>
        </div>
      </div>
      <div className="grow w-full m-auto flex flex-col items-start justify-start">
        <aside
          aria-hidden={!expand}
          className={classnames(
            "fixed inset-x-0 bottom-0 top-[42px] z-30 flex w-full flex-col items-start justify-between border-t border-stone-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)] dark:border-white/10 dark:bg-[#0a2328]/95 md:hidden motion-reduce:transition-none",
            expand
              ? "translate-x-0 opacity-100"
              : "pointer-events-none -translate-x-full opacity-0",
          )}
        >
          <div className="w-full flex flex-col space-y-2">
            <div className="w-full flex flex-row justify-between">
              <button
                type="button"
                aria-label="Close navigation"
                className="ml-auto flex size-10 items-center justify-center rounded-full text-stone-500 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:hover:bg-white/10 dark:hover:text-white motion-reduce:transition-none"
                onClick={() => setExpand(false)}
              >
                <Cross1Icon className="size-5" />
              </button>
            </div>
            <Link
              className={classnames(
                "border-b separator p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 dark:text-white dark:hover:bg-yellow-900 hover:bg-yellow-100",
                {
                  "bg-yellow-100 dark:bg-yellow-900":
                    pathname === "/home" || pathname.includes("/home/doc"),
                },
              )}
              href="/home"
            >
              <HomeIcon />
              <span className="ml-4">Library</span>
            </Link>
            <Link
              className={classnames(
                "p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 rounded-md dark:text-white dark:hover:bg-yellow-900 hover:bg-yellow-100",
                {
                  "bg-yellow-100 dark:bg-yellow-900":
                    pathname === "/home/settings",
                },
              )}
              href="/home/settings"
            >
              <GearIcon />
              <span className="ml-4">Settings</span>
            </Link>
          </div>
          <div className="mt-60 md:mt-0 mb-8 md:mb-0 w-full flex flex-row justify-between items-center">
            <UserButton />
            <div className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-700 rounded-full">
              <ThemeModeButton />
            </div>
          </div>
        </aside>
        {children}
      </div>
    </main>
  );
}
