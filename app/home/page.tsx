import { auth } from "@clerk/nextjs/server";
import SearchBar from "./search-bar";
import SiteList from "./site-list";
import SearchResult from "./search-result";
import TabsView from "@/components/tabs";
import ExcerptList from "./excerpt-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth()
  const q = (await searchParams).q;
  const tab = ((await searchParams).tab ?? 'sites') as string;

  if (!userId) return null;
  const tabs = [
    {
      id: 'sites',
      label: 'Sites',
    },
    {
      id: 'excerpts',
      label: 'Excerpts',
    }
  ]
  return (
    <main className="grow w-full flex flex-col items-start justify-start">
      <div className="mt-8 mb-6 container mx-auto flex items-center justify-between">
       {q ? 
        <h1 className="dark:text-white font-semibold">
          Search Result for {q}
        </h1>
        : <TabsView tabs={tabs} active={tab} />
      }
        <SearchBar></SearchBar>
      </div>
      {q ? <SearchResult /> : tab === 'sites' ? <SiteList /> : <ExcerptList />}
    </main>
  );
}
