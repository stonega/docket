import { UserButton } from "@clerk/nextjs";
import classnames from "classnames";
import { playfair } from "./fonts";
import Link from "next/link";

const Header = () => {
  return (
    <div className="fixed top-0 w-full flex flex-row justify-between px-4 py-2 shadow-sm">
      <Link
        href="/"
        className={classnames(
          "text-3xl font-semibold font-serif dark:text-white",
          playfair.variable,
        )}
      >
        Docket
      </Link>
      <div className="flex flex-row space-x-4 items-center">
        <UserButton afterSignOutUrl="/home" />
      </div>
    </div>
  );
};

export default Header;
