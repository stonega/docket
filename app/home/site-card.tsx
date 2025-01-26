"use client";
import { Site } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { siteOneColumnLayoutAtom } from "@/store";

interface SiteCardProps {
  site: Site;
}
export default function SiteCard({ site }: SiteCardProps) {
  const [oneColumn] = useAtom(siteOneColumnLayoutAtom);
  const router = useRouter();
  if (oneColumn)
    return (
      <>
        <div
          key="record.id"
          className="group h-20 items-center bg-cream-200 dark:bg-cream-700 rounded-md border border-black dark:border-yellow-700 relative p-2 hover:bg-yellow-200 dark:hover:bg-yellow-600 cursor-pointer flex flex-row"
          onClick={() => router.push(`/home/doc/${site.id}`)}
        >
          {site.icon ? (
            <Image
              alt={site.title}
              src={site.icon}
              unoptimized
              width={35}
              height={35}
              className="mx-4"
            />
          ) : (
            <Image
              alt={site.title}
              src={`https://avatar.tobi.sh/${site.title}.png`}
              unoptimized
              width={35}
              height={35}
              className="mx-4 rounded-full"
            />
          )}
          <div className="line-clamp-1 text-lg text-ellipsis overflow-hidden text-center dark:text-stone-300">
            {site.title}
          </div>
          <div className="w-12 overflow-hidden">
            {/* <div className="w-full group-hover:translate-y-0 translate-y-32 transition ease mt-4 flex flex-row justify-center items-center">
            <div className="p-1.5 hover:bg-yellow-400">
              <TrashIcon></TrashIcon>
            </div>
          </div> */}
          </div>
        </div>
      </>
    );
  return (
    <>
      <div
        key="record.id"
        className="group rounded-md h-48 bg-cream-200 dark:bg-yellow-700 border justify-between border-black dark:border-yellow-700 relative p-2 hover:bg-yellow-200 dark:hover:bg-yellow-600 cursor-pointer flex flex-col"
        onClick={() => router.push(`/home/doc/${site.id}`)}
      >
        {site.icon ? (
          <Image
            alt={site.title}
            src={site.icon}
            unoptimized
            width={35}
            height={35}
            className="my-2 mx-auto"
          />
        ) : (
          <Image
            alt={site.title}
            src={`https://avatar.tobi.sh/${site.title}.png`}
            unoptimized
            width={35}
            height={35}
            className="my-2 mx-auto rounded-full"
          />
        )}
        <div className="font-bold line-clamp-2 text-lg text-ellipsis overflow-hidden text-center dark:text-stone-300">
          {site.title}
        </div>
        <div className="h-12 w-full overflow-hidden">
          {/* <div className="w-full group-hover:translate-y-0 translate-y-32 transition ease mt-4 flex flex-row justify-center items-center">
            <div className="p-1.5 hover:bg-yellow-400">
              <TrashIcon></TrashIcon>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}
