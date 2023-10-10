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
    <div className="mt-20 w-[800px] mx-auto flex flex-col h-full space-y-2 dark:text-white">
      <div className="flex flex-row items-center space-x-4 mb-4">
        <h1 className="font-serif font-bold text-3xl">{site.title}</h1>
        <a href={site.url} target="_blank">
          <ExternalLinkIcon className="w-6 h-6" />
        </a>
      </div>
      <ExcerptsList siteId={siteId} />
    </div>
  );
}
