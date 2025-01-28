import BackButton from "@/components/back-button";
import Image from "next/image";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

export default function Loading() {
  return (
    <>
      <div className="grow bg-cream-100 dark:bg-[#302a30] border border-t-0 border-black dark:border-white pb-20 container mx-auto flex flex-col h-full dark:text-white">
        <div className="border-b border-black dark:border-white bg-cream-100 dark:bg-[#302a30] h-[60px] sticky top-[20px] px-4 w-full flex flex-row justify-between items-center">
          <BackButton>
            <Image
              alt=""
              src={`https://avatar.tobi.sh/loading.png`}
              unoptimized
              width={24}
              height={24}
              className="mx-4 rounded-full"
            />
          </BackButton>
          <div className="flex flex-row space-x-4 items-center">
            <a target="_blank" href="">
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="m-4 animate-pulse">
          <div className="mt-2 h-8 w-[50%] rounded-md bg-black/50 dark:bg-white/50"></div>
        </div>
        <div className="px-4 flex animate-pulse flex-col space-y-2">
          <div className="mt-2 h-4 w-[20%] rounded-md bg-black/50 dark:bg-white/50"></div>
          <div className="text-md mt-2 h-4 w-full rounded-md bg-black/50 dark:bg-white/50"></div>
          <div className="mt-2 h-4 w-[60%] rounded-md bg-black/50 dark:bg-white/50"></div>
          <div className="mt-2 h-4 w-[30%] rounded-md bg-black/50 dark:bg-white/50"></div>
        </div>
      </div>
    </>
  );
}
