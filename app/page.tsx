import { GearIcon, HomeIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import ThemeModeButton from "./theme-mode-button";
export default function Home() {
  return (
    <main className="flex flex-row items-start justify-start">
      <aside className="h-screen pt-16 pb-4 ml-4 mr-1">
        <div className="h-full flex flex-col justify-between items-center w-16 py-4 space-y-8 bg-orange-100 border-2 border-orange-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex flex-col justify-start">
            <Link
              className="p-1.5 text-black focus:outline-nones transition-colors duration-200 rounded-lg dark:text-white dark:hover:bg-gray-800 hover:bg-gray-100"
              href="/dashboard"
            >
              <HomeIcon />
            </Link>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <ThemeModeButton />
            <Link
              className="p-1.5 text-black focus:outline-nones transition-colors duration-200 rounded-lg dark:text-white dark:hover:bg-gray-800 hover:bg-gray-100"
              href="/settings"
            >
              <GearIcon />
            </Link>
          </div>
        </div>
      </aside>
      <div className="h-screen pt-16 pb-4 mr-2 dark:text-white">
        <div className="h-full flex flex-col items-start p-2 w-60 space-y-2 bg-orange-100 border-2 border-orange-200 dark:bg-gray-900 dark:border-gray-700 after:w-4 after:h-2 after:bg-orange-100 after:absolute after:-right-1 after:-top-1 after:rotate-45 after:rounded-t-lg">
          <div className="w-full relative p-2 hover:bg-orange-200 cursor-pointer flex flex-col after:w-4 after:h-2 after:bg-orange-100 after:absolute after:-right-1 after:-top-1 after:rotate-45 after:rounded-t-lg">
            <div className="font-semibold text-lg text-ellipsis overflow-hidden">
              React
            </div>
            <div className="text-sm text-ellipsis overflow-hidden">
              https://react.dev
            </div>
          </div>
          <div className="w-full p-2 hover:bg-orange-100 rounded-md cursor-pointer flex flex-col">
            <div className="font-semibold text-lg">React</div>
            <div className="text-sm">https://react.dev</div>
          </div>
        </div>
      </div>
      <div className="pt-16 flex-col w-full h-full ml-10 mr-20 space-y-2 dark:text-white">
        <div className="border-0 border-orange-200 p-2">
          React apps are made out of components. A component is a piece of the
          UI (user interface) that has its own logic and appearance. A component
          can be as small as a button, or as large as an entire page. React
          components are JavaScript functions that return markup:
        </div>
        <div className="border-0 border-orange-200 p-2">
          React apps are made out of components. A component is a piece of the
          UI (user interface) that has its own logic and appearance. A component
          can be as small as a button, or as large as an entire page. React
          components are JavaScript functions that return markup:
        </div>
      </div>
    </main>
  );
}
