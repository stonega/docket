"use client";
import { GearIcon, HomeIcon, Cross1Icon } from "@radix-ui/react-icons";
import Link from "next/link";
import ThemeModeButton from "../../components/theme-mode-button";
import { playfair } from "../fonts";
import classnames from "classnames";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { menuAtom } from "@/store";
import { useAtom } from "jotai";
import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
      animate(scope.current, { left: "-500px" }, { ease: "linear" });
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
          "fixed z-10 top-0 left-0 md:sticky p-4 h-[400px] w-full md:w-auto md:h-screen flex flex-col justify-between items-start first-letter:space-y-4 bg-orange-200 dark:bg-yellow-800"
        )}
      >
        <div className="w-full flex flex-col space-y-2">
          <div className="w-full flex flex-row justify-between">
            <div className="mb-8 flex flex-row space-x-2 mr-10">
              <Image
                alt="Docket"
                src="/docket.png"
                unoptimized
                width={40}
                height={35}
              />
              <Link
                href="/"
                className={classnames(
                  "text-4xl font-semibold font-serif dark:text-white",
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
            className="p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 rounded-md dark:text-white dark:hover:bg-yellow-900 hover:bg-yellow-100"
            href="/home"
          >
            <HomeIcon />
            <span className="ml-4">Library</span>
          </Link>
          <Link
            className="p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 rounded-md dark:text-white dark:hover:bg-yellow-900 hover:bg-yellow-100"
            href="/home/settings"
          >
            <GearIcon />
            <span className="ml-4">Settings</span>
          </Link>
        </div>
        <div className="w-full flex flex-row justify-between items-center">
          <UserButton afterSignOutUrl="/home" />
          <div className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-700 rounded-full">
            <ThemeModeButton />
          </div>
        </div>
      </aside>
      {children}
    </main>
  );
}
