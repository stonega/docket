import BackButton from "@/components/back-button";
import ExcerptsList from "./excerpts-list";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ExternalIcon from "@/components/external-icon";
import MenuDropdown from "./menu";
import Title from "./title";

export default async function Page({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const siteId = (await params).site;
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
    <div className="grow border border-t-0 border-black dark:border-white pb-4 h-full container bg-cream-100 dark:bg-[#302a30] mx-auto flex flex-col dark:text-white">
      <div className="border-b border-black dark:border-white bg-cream-100 dark:bg-[#302a30] h-[60px] sticky top-[62px] px-4 w-full flex flex-row justify-between items-center">
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
            <ExternalIcon className="size-6" />
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
