import BackButton from "@/components/back-button";
import ExcerptsList from "./excerpts_list";
import { prisma } from "@/lib/prisma";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

export default async function Page({ params }: { params: { site: string } }) {
  const siteId = params.site;
  const site = await prisma.site.findUnique({
    where: { id: siteId },
  });
  if (!site) return null;
  return (
    <div className="my-20 w-[800px] mx-auto flex flex-col h-full space-y-2 dark:text-white">
      <BackButton />
      <div className="mb-4">
        <h1 className="font-serif font-bold text-3xl inline">{site.title}</h1>
        <a href={site.url} target="_blank" className="inline-block ml-2">
          <ExternalLinkIcon className="w-6 h-6 text-stone-500 dark:text-stone-200" />
        </a>
      </div>
      <ExcerptsList siteId={siteId} />
    </div>
  );
}
