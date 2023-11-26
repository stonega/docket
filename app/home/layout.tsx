"use client";
import {
  GearIcon,
  HomeIcon,
  Cross1Icon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import ThemeModeButton from "../../components/theme-mode-button";
import { playfair } from "../fonts";
import classnames from "classnames";
import { UserButton } from "@clerk/nextjs";
import { menuAtom } from "@/store";
import { useAtom } from "jotai";
import { motion, useAnimate } from "framer-motion";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/logo";

export default function Layout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const [expand, setExpand] = useAtom(menuAtom);
  const [scope, animate] = useAnimate();
  const pathname = usePathname();

  useEffect(() => {
    if (expand) {
      animate(scope.current, { left: 0 }, { ease: "linear" });
    } else {
      animate(scope.current, { left: "-1000px" }, { ease: "linear" });
    }
  }, [animate, expand, scope]);

  useEffect(() => {
    setExpand(false);
  }, [pathname, setExpand]);

  return (
    <main className="m-auto flex flex-row items-start justify-start">
      <aside
        ref={scope}
        className={classnames(
          "fixed z-10 top-0 left-[-1000px] md:left-0 md:sticky p-4 w-full md:w-auto h-screen flex flex-col justify-between items-start first-letter:space-y-4 bg-orange-200 dark:bg-yellow-800"
        )}
      >
        <div className="w-full flex flex-col space-y-2">
          <div className="w-full flex flex-row justify-between">
            <div className="mb-8 flex flex-row space-x-2 mr-10">
              <Logo className="w-10 h-10"></Logo>
              <Link
                href="/"
                className={classnames(
                  "text-4xl font-semibold font-serif dark:text-stone-200",
                  playfair.className
                )}
              >
                Docket
              </Link>
            </div>
            <Cross1Icon
              className="md:hidden mx-2 w-6 h-6 text-gray-500 cursor-pointer"
              onClick={() => setExpand(false)}
            />
          </div>
          <Link
            className={classnames(
              "p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 rounded-md dark:text-white dark:hover:bg-yellow-900 hover:bg-yellow-100",
              {
                "bg-yellow-100 dark:bg-yellow-900":
                  pathname === "/home" || pathname.includes("/home/doc"),
              }
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
              }
            )}
            href="/home/settings"
          >
            <GearIcon />
            <span className="ml-4">Settings</span>
          </Link>
        </div>
        <div className="mt-60 md:mt-0 mb-8 md:mb-0 w-full flex flex-row justify-between items-center">
          <UserButton afterSignOutUrl="/" />
          <div className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-700 rounded-full">
            <ThemeModeButton />
          </div>
        </div>
      </aside>
      <div className="w-full md:w-[800px] m-auto mt-0 md:mt-10 py-4 md:py-0 flex flex-col items-start justify-start">
        <div className="md:hidden px-4 mb-2 flex flex-row space-x-2 items-center mr-10">
          <HamburgerMenuIcon
            className="md:hidden w-6 h-6 text-stone-500 dark:text-stone-200 cursor-pointer"
            onClick={() => setExpand(true)}
          ></HamburgerMenuIcon>
          <Logo className="w-8 h-8"></Logo>
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
        {children}
      </div>
    </main>
  );
}
