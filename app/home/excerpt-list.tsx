"use client";
import { usePagination } from "@/hooks/use-pagination";
import { Excerpt } from "@prisma/client";
import { LoadMore } from "@/components/load-more";
import classnames from "classnames";
import ExcerptCard from "@/components/excerpt-card";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

export default function ExcerptList() {
  const { records, setPage, isLoading, hasMore } =
    usePagination<Excerpt>("/api/excerpt?type=text");

  return (
    <div className="mx-auto container">
      <div className="flex flex-col justify-start items-center">
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }} className="w-full">
          <Masonry gutter="10px">
            {records &&
              records.map((record) => (
                <div className="w-full p-4 rounded-md bg-excerpts-100" key={record.id}>
                    <ExcerptCard excerpt={record} />
                </div>
              ))}
            {isLoading &&
              ["✨", "✨", "✨"].map((_, index) => (
                <div className="p-2" key={index}>
                  <div
                    className={classnames(
                      "bg-cream-200 dark:bg-[#302a30] rounded-md border separator relative p-2 flex flex-col",
                    )}
                  >
                    <div
                      className={classnames("flex flex-col animate-pulse items-center")}
                    >
                      <div
                        className={classnames(
                          "mt-2 h-10 w-10 rounded-full bg-black/50",
                        )}
                      ></div>
                      <div
                        className={classnames(
                          "mt-5 w-[80%] h-4 rounded-md bg-black/50",
                        )}
                      ></div>
                      <div
                        className={classnames(
                          "block mt-2 h-4 w-[40%] rounded-md bg-black/50",
                        )}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </Masonry>
        </ResponsiveMasonry>
        <LoadMore
          isLoading={isLoading}
          hasMore={hasMore}
          setPage={setPage}
          empty={records.length === 0}
        />
      </div>
    </div>
  );
}
