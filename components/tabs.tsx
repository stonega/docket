"use client";

import * as React from "react";
import classnames from "classnames";
import { NavigationMenu } from "radix-ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface TabNavProps {
  tabs: {
    id: string,
    label: string,
  }[],
  active: string
}
const TabNav = ({ tabs, active }: TabNavProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const tabStyle = useCallback((tabId: string) => {
    if (tabId === 'sites') {
      return active === 'sites' ? 'bg-sites-400' : 'hover:bg-sites-100'
    }
    return active === 'excerpts' ? 'bg-excerpts-400' : 'hover:bg-excerpts-100'
  }, [active])

  return (
    <NavigationMenu.Root className="relative z-10 flex list-none border separator rounded-md p-[1px] space-x-[2px]">
      {
        tabs.map((tab) => (
          <NavigationMenu.Item key={tab.id}
            onClick={() => {
              router.push(`?${createQueryString("tab", tab.id)}`);
            }}
            className={classnames("font-semibold block cursor-pointer select-none rounded px-1 py-1 leading-none no-underline outline-none",
              tabStyle(tab.id)
            )}>
            {tab.label}
          </NavigationMenu.Item>
        ))
      }
    </NavigationMenu.Root >
  )
};

export default TabNav;

