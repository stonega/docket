import { auth } from "@clerk/nextjs/server";
import SearchBar from "./search-bar";
import SiteList from "./site-list";
import SearchResult from "./search-result";
import TabsView from "@/components/tabs";
import ExcerptList from "./excerpt-list";
import { fraunces } from "../fonts";
import ArticleList from "./article-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const requestedTab = typeof params.tab === "string" ? params.tab : "sites";
  const tab = requestedTab === "excerpts" || requestedTab === "articles"
    ? requestedTab
    : "sites";

  if (!userId) return null;
  const tabs = [
    {
      id: "sites",
      label: "Sites",
    },
    {
      id: "excerpts",
      label: "Excerpts",
    },
    {
      id: "articles",
      label: "Articles",
    },
  ];

  return (
    <main className="relative flex w-full grow flex-col overflow-hidden text-stone-950 dark:text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(254,240,138,0.22),transparent_58%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(113,63,18,0.18),transparent_58%)]"
      />
      <div className="container relative mx-auto w-full px-4 py-8 sm:px-6 sm:py-10">
        <header className="library-enter max-w-3xl">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Your library
          </p>
          <h1
            className={`${fraunces.className} mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl`}
          >
            {query ? "Search results" : "Your saved knowledge"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300 sm:text-[0.9375rem]">
            {query ? (
              <>
                Library results for{" "}
                <span className="rounded-md bg-excerpts-100 px-1.5 py-0.5 font-medium text-excerpts-900 dark:bg-excerpts-950 dark:text-excerpts-200">
                  {query}
                </span>
              </>
            ) : (
              "Keep useful sources and the details worth returning to in one focused place."
            )}
          </p>
        </header>

        <div className="library-enter library-enter-delay mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {query ? (
            <div className="flex min-h-10 items-center gap-2 px-3 text-sm font-medium text-stone-700 dark:text-stone-200">
              <span className="size-2 rounded-full bg-excerpts-500" />
              Searching articles and excerpts
            </div>
          ) : (
            <TabsView tabs={tabs} active={tab} />
          )}
          <SearchBar />
        </div>

        <section className="library-enter library-enter-delay mt-7" aria-live="polite">
          {query ? (
            <SearchResult />
          ) : tab === "sites" ? (
            <SiteList />
          ) : tab === "excerpts" ? (
            <ExcerptList />
          ) : (
            <ArticleList />
          )}
        </section>
      </div>
    </main>
  );
}
