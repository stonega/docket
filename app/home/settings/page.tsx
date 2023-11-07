import { NotionLogoIcon } from "@radix-ui/react-icons";
export default function SettingsPage() {
  return (
    <div className="my-10 px-4 w-full md:w-[800px] mx-auto flex flex-col h-full space-y-6 dark:text-white">
      <h1 className="font-bold text-2xl">Connect to sync service</h1>
      <div className="flex flex-row items-center space-x-2">
        <NotionLogoIcon className="w-5 h-5" />
        <p className="text-xl">Notion</p>
        <button className="text-yellow-700 ml-8 dark:text-yellow-400">
          Setup
        </button>
      </div>
    </div>
  );
}
