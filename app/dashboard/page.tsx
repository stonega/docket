"use client";
import { LoadMore } from "@/components/load-more";
import { useSites } from "@/hooks/use-api";
import { usePagination } from "@/hooks/use-pagination";
import { Site } from "@prisma/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Page() {
  const { records, setPage, isLoading, hasMore } =
    usePagination<Site>(useSites);
  const router = useRouter();
  return (
    <main className="mt-2 flex flex-row items-start justify-start w-full">
      <div className="relative w-full grid grid-cols-3 gap-4">
        {records &&
          records.map((record) => (
            <div
              key="record.id"
              className="h-40 bg-yellow-100 border-2 border-yellow-200 relative p-2 hover:bg-yellow-200 cursor-pointer flex flex-col after:w-[1.414rem] after:h-[1.414rem] after:bg-yellow-50 dark:after:bg-gray-900 after:border-b-2 after:border-b-yellow-200 after:absolute after:right-0 after:-top-[0.414rem] after:rotate-45 after:origin-bottom-right"
              onClick={() => router.push(`/doc/${record.id}`)}
            >
              <Image
                alt={record.title}
                src={
                  record.icon || `https://avatar.tobi.sh/${record.title}.png`
                }
                unoptimized
                width={35}
                height={35}
                className="m-auto"
              />
              <div className="h-20 text-lg font-semibold text-ellipsis overflow-hidden text-center">
                {record.title}
              </div>
              {/* <div className="text-sm first-letter text-ellipsis overflow-hidden">
                {record.description}
              </div> */}
            </div>
          ))}
      </div>
      <LoadMore isLoading={isLoading} hasMore={hasMore} setPage={setPage} />
    </main>
  );
}
