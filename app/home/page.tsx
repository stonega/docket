import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import SearchBar from "./search-bar";
import SiteList from "./site-list";
import SearchResult from "./search-result";

export default async function Page({
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId } = auth();
  if (!userId) return null;
  return (
    <main className="w-full md:w-[800px] m-auto mt-0 md:mt-10 py-4 md:py-0 flex flex-col items-start justify-start">
      <SearchBar></SearchBar>
      {searchParams.q ? <SearchResult /> : <SiteList />}
    </main>
  );
}
