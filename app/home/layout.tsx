import { GearIcon, HomeIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import ThemeModeButton from "../../components/theme-mode-button";
import { playfair } from "../fonts";
import classnames from "classnames";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

export default function Layout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="m-auto flex flex-row items-start justify-start">
      <aside className="sticky top-0 p-4 h-screen flex flex-col justify-between items-start first-letter:space-y-4 bg-orange-200 dark:bg-yellow-800">
        <div className="flex flex-col space-y-2">
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
          <Link
            className="p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 rounded-lg dark:text-white dark:hover:bg-gray-800 hover:bg-yellow-100"
            href="/home"
          >
            <HomeIcon />
            <span className="ml-4">Library</span>
          </Link>
          <Link
            className="p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 rounded-lg dark:text-white dark:hover:bg-gray-800 hover:bg-yellow-100"
            href="/home/settings"
          >
            <GearIcon />
            <span className="ml-4">Settings</span>
          </Link>
        </div>
        <div className="w-full flex flex-row justify-between items-center">
          <UserButton afterSignOutUrl="/home" />
          <div className="p-1.5">
            <ThemeModeButton />
          </div>
        </div>
      </aside>
      {children}
    </main>
  );
}
