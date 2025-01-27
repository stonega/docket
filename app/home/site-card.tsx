"use client";
import ExternalIcon from "@/components/external-icon";
import { Site } from "@prisma/client";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SiteCardProps {
  site: Site;
}
export default function SiteCard({ site }: SiteCardProps) {
  const router = useRouter();
  return (
    <div
      key="record.id"
      className="group rounded-md w-full bg-cream-200 border justify-between border-black hover:bg-yellow-200 cursor-pointer flex flex-col"
      onClick={() => router.push(`/home/doc/${site.id}`)}
    >
      <div className="grow flex flex-col p-2">
        {site.icon ? (<Image
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
        <div className="font-bold line-clamp-2 text-lg text-ellipsis overflow-hidden text-center">
          {site.title}
        </div>
      </div>
      <a href={site.url} target="_blank" onClick={(event) => event.stopPropagation()} className="border-t border-black p-2 w-full inline-flex items-center line-clamp-1 text-sm text-ellipsis overflow-hidden text-center underline">
        <span>{site.url}</span>
        <ExternalLinkIcon className="size-4 ms-1" />
      </a>
    </div>
  );
}
