import { Site } from "@prisma/client";
import Image from "next/image";
import { TrashIcon, Pencil2Icon } from "@radix-ui/react-icons";
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
          className="group h-20 items-center bg-yellow-100 dark:bg-yellow-700 border-2 border-yellow-200 dark:border-yellow-800 relative p-2 hover:bg-yellow-200 dark:hover:bg-yellow-600 cursor-pointer flex flex-row after:w-[1.414rem] after:h-[1.414rem] after:bg-yellow-50 dark:after:bg-yellow-950 after:border-b-2 after:border-b-yellow-200 dark:after:border-b-yellow-800 after:absolute after:right-0 after:-top-[0.414rem] after:rotate-45 after:origin-bottom-right"
          onClick={() => router.push(`/home/doc/${site.id}`)}
        >
          <Image
            alt={site.title}
            src={site.icon || `https://avatar.tobi.sh/${site.title}.png`}
            unoptimized
            width={35}
            height={35}
            className="mx-4"
          />
          <div className="line-clamp-1 text-lg font-semibold text-ellipsis overflow-hidden text-center dark:text-stone-300">
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
        className="group h-40 bg-yellow-100 dark:bg-yellow-700 border-2 justify-between border-yellow-200 dark:border-yellow-800 relative p-2 hover:bg-yellow-200 dark:hover:bg-yellow-600 cursor-pointer flex flex-col after:w-[1.414rem] after:h-[1.414rem] after:bg-yellow-50 dark:after:bg-yellow-950 after:border-b-2 after:border-b-yellow-200 dark:after:border-b-yellow-800 after:absolute after:right-0 after:-top-[0.414rem] after:rotate-45 after:origin-bottom-right"
        onClick={() => router.push(`/home/doc/${site.id}`)}
      >
        <Image
          alt={site.title}
          src={site.icon || `https://avatar.tobi.sh/${site.title}.png`}
          unoptimized
          width={35}
          height={35}
          className="my-2 mx-auto"
        />
        <div className="line-clamp-2 text-lg font-semibold text-ellipsis overflow-hidden text-center dark:text-stone-300">
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
