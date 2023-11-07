import BackButton from "@/components/back-button";
import Image from "next/image";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

export default function Loading() {
  return (
    <>
      <div className="mt-0 md:mt-10 mb-20 w-[800px] mx-auto flex flex-col h-full dark:text-white px-4 md:px-0">
        <div className="h-[40px] bg-orange-100/70 dark:bg-orange-500/70 sticky top-10 px-4 rounded-full w-full flex flex-row justify-between items-center">
          <BackButton>
            <Image
              alt=""
              src={`https://avatar.tobi.sh/loading.png`}
              unoptimized
              width={20}
              height={20}
              className="mx-4 rounded-full"
            />
          </BackButton>
          <div className="flex flex-row space-x-4 items-center">
            <a target="_blank" href="">
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="my-4 animate-pulse">
          <div className="mt-2 h-8 w-[50%] rounded-md bg-black/50"></div>
        </div>
        <div className="flex animate-pulse flex-col space-y-2">
          <div className="mt-2 h-4 w-[20%] rounded-md bg-black/50"></div>
          <div className="text-md mt-2 h-4 w-full rounded-md bg-black/50"></div>
          <div className="mt-2 h-4 w-[60%] rounded-md bg-black/50"></div>
          <div className="mt-2 h-4 w-[30%] rounded-md bg-black/50"></div>
        </div>
      </div>
    </>
  );
}
