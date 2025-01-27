import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import classnames from "classnames";
import { fraunces } from "./fonts";
import Link from "next/link";
import Logo from "@/components/logo";
import ThemeModeButton from "@/components/theme-mode-button";

const Header = async () => {
  const { userId } = await auth()
  return (
    <div className="sticky bg-white dark:bg-black top-2 w-full flex justify-between px-4 border-y border-black dark:border-white">
      <Link
        href="/"
        className={classnames(
          "inline-flex p-2 text-3xl font-semibold font-serif dark:text-white border-x border-black dark:border-white",
          fraunces.className
        )}
      >
        <Logo className="w-8 me-2"></Logo>
        <span>Docket</span>
      </Link>
      <div className="flex items-center justify-end">
        <div className="h-full flex items-center border-l border-black dark:border-white px-4">
          <ThemeModeButton />
        </div>
        <div className="h-full flex items-center border-l border-black dark:border-white px-4">
          {
            userId ? <UserButton /> : <Link href="/home" className="font-bold cursor-pointer">Log In</Link>
          }
        </div>
      </div>
    </div >
  );
};

export default Header;
