"use client";
import {
  GearIcon,
  HomeIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import ThemeModeButton from "../../components/theme-mode-button";
import { fraunces } from "../fonts";
import classnames from "classnames";
import { UserButton } from "@clerk/nextjs";
import { menuAtom } from "@/store";
import { useAtom } from "jotai";
import { useAnimate } from "framer-motion";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "../footer";
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
    <main className="min-h-screen flex flex-col">
      <div className="sticky top-0 bg-white dark:bg-[#0a2328] h-2 w-full" />
      <div className="sticky top-2 bg-white dark:bg-[#0a2328] w-full flex justify-between border-y border-black dark:border-white">
        <div className="inline-flex items-center">
          <Link
            href="/"
            className={classnames(
              "inline-flex text-2xl font-semibold text-black dark:text-white border-e border-black dark:border-white",
              fraunces.className
            )}
          >
            <Logo className="p-1 w-8 border-e border-black dark:border-white"></Logo>
            <span className="p-1">Docket</span>
          </Link>
          {/* <HamburgerMenuIcon */}
          {/*   className="md:hidden w-6 h-6 text-black dark:text-white cursor-pointer ms-2" */}
          {/*   onClick={() => setExpand(true)} */}
          {/* ></HamburgerMenuIcon> */}
        </div>
        <div className="flex items-center justify-end">
          <div className="h-full flex items-center border-l border-black dark:border-white px-4">
            <ThemeModeButton />
          </div>
          <div className="h-full flex justify-end items-center border-s border-black dark:border-white px-4">
            <UserButton />
          </div>
        </div>
      </div >
      <div className="grow w-full m-auto flex flex-col items-start justify-start">
        <aside
          ref={scope}
          className={classnames(
            "fixed z-10 top-2 left-[-1000px] border border-black my-2 md:hidden p-4 w-full md:w-auto h-full flex flex-col justify-between items-start first-letter:space-y-4"
          )}
        >
          <div className="w-full flex flex-col space-y-2">
            <div className="w-full flex flex-row justify-between">
              <Cross1Icon
                className="md:hidden mx-2 w-6 h-6 text-gray-500 cursor-pointer"
                onClick={() => setExpand(false)}
              />
            </div>
            <Link
              className={classnames(
                "border-b border-black p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 dark:text-white dark:hover:bg-yellow-900 hover:bg-yellow-100",
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
            <UserButton />
            <div className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-700 rounded-full">
              <ThemeModeButton />
            </div>
          </div>
        </aside>
        {children}
        <Footer />
      </div>
    </main>
  );
}
