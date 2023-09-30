import { UserButton } from "@clerk/nextjs";
import ThemeModeButton from "./theme-mode-button";

const Header = () => {
  return (
    <div className="fixed w-full flex flex-row justify-between px-10 py-4 bg-yellow-200 dark:bg-yellow-800">
      <span className="text-3xl font-semibold">Docspocket</span>
      <div className="flex flex-row space-x-4 items-center">
        <ThemeModeButton />
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Header;
