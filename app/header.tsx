import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import classnames from "classnames";
import { fraunces } from "./fonts";
import Link from "next/link";
import Logo from "@/components/logo";

const Header = async () => {
  const { userId } = await auth()
  return (
    <div className="sticky bg-white top-2 w-full flex justify-between px-4 border-y border-black">
      <Link
        href="/"
        className={classnames(
          "inline-flex p-2 text-3xl font-semibold font-serif dark:text-white border-x border-black",
          fraunces.className
        )}
      >
        <Logo className="w-8 me-2"></Logo>
        <span>Docket</span>
      </Link>
      <div className="flex flex-row space-x-4 items-center border-l border-black px-4">
        {
          userId ? <UserButton /> : <Link href="/home" className="font-bold cursor-pointer">Log In</Link>
        }
      </div>
    </div >
  );
};

export default Header;
