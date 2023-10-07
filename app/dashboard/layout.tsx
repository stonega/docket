import { GearIcon, HomeIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import ThemeModeButton from "../../components/theme-mode-button";

export default function Layout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-[800px] m-auto flex flex-row items-start justify-start">
      <aside className="sticky top-16 mr-2 h-full flex flex-col justify-start items-start w-40 space-y-2">
        <Link
          className="p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 rounded-lg dark:text-white dark:hover:bg-gray-800 hover:bg-yellow-100"
          href="/dashboard"
        >
          <HomeIcon />
          <span className="ml-4">Home</span>
        </Link>
        <Link
          className="p-1.5 flex flex-row items-center text-black focus:outline-nones transition-colors duration-200 rounded-lg dark:text-white dark:hover:bg-gray-800 hover:bg-yellow-100"
          href="/dashboard/settings"
        >
          <GearIcon />
          <span className="ml-4">Settings</span>
        </Link>
        <div className="p-1.5">
          <ThemeModeButton />
        </div>
      </aside>
      {children}
    </main>
  );
}
