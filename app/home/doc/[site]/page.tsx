import BackButton from "@/components/back-button";
import ExcerptsList from "./excerpts_list";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ExternalLinkIcon, Pencil2Icon } from "@radix-ui/react-icons";
import MenuDropdown from "./menu";
import Title from "./title";

export default async function Page({ params }: { params: { site: string } }) {
  const siteId = params.site;
  const site = await prisma.site.findUnique({
    where: { id: siteId },
  });
  const excerpts = await prisma.excerpt.findMany({
    where: { siteId: siteId },
    orderBy: {
      createAt: "asc",
    },
  });
  if (!site) return null;
  return (
    <div className="mt-0 md:mt-10 mb-20 w-[800px] mx-auto flex flex-col h-full dark:text-white px-4 md:px-0">
      <div className="h-[40px] bg-orange-100/70 dark:bg-orange-500/70 sticky top-10 px-4 rounded-full w-full flex flex-row justify-between items-center">
        <BackButton>
          <Image
            alt={site.title}
            src={site.icon || `https://avatar.tobi.sh/${site.title}.png`}
            unoptimized
            width={20}
            height={20}
            className="mx-4"
          />
        </BackButton>
        <div className="flex flex-row space-x-4 items-center">
          <a target="_blank" href={site.url}>
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
          <MenuDropdown link={site.url} siteId={site.id} />
        </div>
      </div>
      <div className="my-4">
        <Title site={site} />
      </div>
      <ExcerptsList excerpts={excerpts} siteUrl={site.url} />
    </div>
  );
}
