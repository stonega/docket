"use client";
import { Site } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SiteCardProps {
  site: Site;
}
export default function SiteCard({ site }: SiteCardProps) {
  const router = useRouter();
  return (
    <>
      <div
        key="record.id"
        className="group aspect-[3/1] rounded-md h-48 bg-cream-200 border justify-between border-black relative p-2 hover:bg-yellow-200 cursor-pointer flex flex-col"
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
