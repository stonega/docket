"use client";
import { usePagination } from "@/hooks/use-pagination";
import { Site } from "@prisma/client";
import Grid from "./grid";
import { LoadMore } from "@/components/load-more";
import SiteCard from "./site-card";
import classnames from "classnames";

export default function SiteList() {
  const { records, setPage, isLoading, hasMore } =
    usePagination<Site>("/api/site");

  return (
    <div className="mx-auto container">
      <div className="py-4 px-6 flex flex-col justify-between dark:text-white">
        <span className="font-bold text-2xl">Inside your docket</span>
      </div>
      <div className="flex flex-col justify-start items-center">
        <Grid>
          {records &&
            records.map((record) => <SiteCard site={record} key={record.id} />)}
          {isLoading &&
            ["✨", "✨", "✨"].map((_, index) => (
              <div key={index}>
                <div
                  className={classnames(
                    "bg-cream-200 rounded-md border border-black relative p-2 flex flex-col",
                  )}
                  key={index}
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
        </Grid>
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
