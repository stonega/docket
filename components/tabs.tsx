"use client";

import classnames from "classnames";
import { NavigationMenu } from "radix-ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface TabNavProps {
  tabs: {
    id: string;
    label: string;
  }[];
  active: string;
}

const TabNav = ({ tabs, active }: TabNavProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const tabStyle = useCallback(
    (tabId: string) => {
      if (tabId === "sites") {
        return active === "sites"
          ? "bg-white text-sites-950 shadow-sm ring-1 ring-sites-200 dark:bg-sites-950 dark:text-sites-100 dark:ring-sites-800"
          : "text-stone-500 hover:bg-sites-50 hover:text-sites-900 dark:text-stone-400 dark:hover:bg-sites-950/60 dark:hover:text-sites-100";
      }
      if (tabId === "excerpts") {
        return active === "excerpts"
          ? "bg-white text-excerpts-950 shadow-sm ring-1 ring-excerpts-200 dark:bg-excerpts-950 dark:text-excerpts-100 dark:ring-excerpts-800"
          : "text-stone-500 hover:bg-excerpts-50 hover:text-excerpts-900 dark:text-stone-400 dark:hover:bg-excerpts-950/60 dark:hover:text-excerpts-100";
      }
      return active === "articles"
        ? "bg-white text-emerald-950 shadow-sm ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:ring-emerald-800"
        : "text-stone-500 hover:bg-emerald-50 hover:text-emerald-900 dark:text-stone-400 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-100";
    },
    [active],
  );

  return (
    <NavigationMenu.Root className="relative z-10">
      <NavigationMenu.List className="flex min-h-10 list-none items-center gap-1 rounded-xl bg-stone-100/90 p-1 dark:bg-white/[0.06]">
        {tabs.map((tab) => {
          const isActive = tab.id === active;

          return (
            <NavigationMenu.Item key={tab.id}>
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  router.push(`?${createQueryString("tab", tab.id)}`, {
                    scroll: false,
                  });
                }}
                className={classnames(
                  "library-motion flex min-h-8 select-none items-center gap-2 rounded-lg px-3 text-sm font-medium outline-none transition-[color,background-color,box-shadow,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none",
                  tabStyle(tab.id),
                )}
              >
                <span
                  aria-hidden="true"
                  className={classnames("size-1.5 rounded-full", {
                    "bg-sites-500": tab.id === "sites",
                    "bg-excerpts-500": tab.id === "excerpts",
                    "bg-emerald-500": tab.id === "articles",
                  })}
                />
                {tab.label}
              </button>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};

export default TabNav;
