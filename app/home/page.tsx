import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import SearchBar from "./search-bar";
import SiteList from "./site-list";
import SearchResult from "./search-result";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth()

  if (!userId) return null;
  return (
    <main className="grow w-full flex flex-col items-start justify-start">
      <SearchBar></SearchBar>
      {(await searchParams).q ? <SearchResult /> : <SiteList />}
    </main>
  );
}
