import { UserButton } from "@clerk/nextjs";
import classnames from "classnames";
import { playfair } from "./fonts";

const Header = () => {
  return (
    <div className="fixed w-full flex flex-row justify-between px-4 py-4">
      <span
        className={classnames(
          "text-4xl font-semibold font-serif dark:text-white",
          playfair.className
        )}
      >
        Docket
      </span>
      <div className="flex flex-row space-x-4 items-center">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Header;
