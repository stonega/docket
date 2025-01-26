import BackButton from "@/components/back-button";
import ExcerptsList from "./excerpts-list";
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
    <div className="grow border border-t-0 border-black pb-4 h-full w-full md:w-[800px] bg-cream-100 mx-auto flex flex-col dark:text-white">
      <div className="border-b border-black bg-[#23a094] h-[60px] sticky top-[60px] px-4 w-full flex flex-row justify-between items-center">
        <BackButton>
          {site.icon ? (
            <Image
              alt={site.title}
              src={site.icon}
              unoptimized
              width={24}
              height={24}
              className="mx-4"
            />
          ) : (
            <Image
              alt={site.title}
              src={`https://avatar.tobi.sh/${site.title}.png`}
              unoptimized
              width={24}
              height={24}
              className="mx-4 rounded-full"
            />
          )}
        </BackButton>
        <div className="flex flex-row space-x-4 items-center">
          <a target="_blank" href={site.url}>
            <ExternalLinkIcon className="size-6" />
          </a>
          <MenuDropdown link={site.url} siteId={site.id} />
        </div>
      </div>
      <div className="m-4">
        <Title site={site} />
      </div>
      <ExcerptsList excerpts={excerpts} siteUrl={site.url} />
    </div>
  );
}
