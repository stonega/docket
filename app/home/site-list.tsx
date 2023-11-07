"use client";
import { usePagination } from "@/hooks/use-pagination";
import { Site } from "@prisma/client";
import Grid from "./grid";
import { LoadMore } from "@/components/load-more";
import SiteCard from "./site-card";
import classnames from "classnames";
import { useAtom } from "jotai";
import { siteOneColumnLayoutAtom } from "@/store";

export default function SiteList() {
  const { records, setPage, isLoading, hasMore } =
    usePagination<Site>("/api/site");
  const [oneColumn] = useAtom(siteOneColumnLayoutAtom);

  return (
    <div className="mt-2 w-full">
      <Grid>
        {records &&
          records.map((record) => <SiteCard site={record} key={record.id} />)}
        {isLoading &&
          ["✨", "✨"].map((_, index) => (
            <>
              <div
                className={classnames(
                  "bg-yellow-100 dark:bg-yellow-700 border-2 border-yellow-200 dark:border-yellow-800 relative p-2 flex after:w-[1.414rem] after:h-[1.414rem] after:bg-yellow-50 dark:after:bg-yellow-950 after:border-b-2 after:border-b-yellow-200 dark:after:border-b-yellow-800 after:absolute after:right-0 after:-top-[0.414rem] after:rotate-45 after:origin-bottom-right",
                  {
                    "h-20 flex-row": oneColumn,
                    "h-40 flex-col": !oneColumn,
                  }
                )}
                key={index}
              >
                <div
                  className={classnames("flex animate-pulse items-center", {
                    "flex-row w-full": oneColumn,
                    "flex-col": !oneColumn,
                  })}
                >
                  <div
                    className={classnames(
                      "h-10 w-10 rounded-full bg-black/50",
                      {
                        "mx-4 my-auto": oneColumn,
                        "mt-2": !oneColumn,
                      }
                    )}
                  ></div>
                  <div
                    className={classnames(
                      "h-4 w-[80%] rounded-md bg-black/50",
                      {
                        "mx-4 w-[50%]": oneColumn,
                        "mt-5 w-[80%]": !oneColumn,
                      }
                    )}
                  ></div>
                  <div
                    className={classnames(
                      "mt-2 h-4 w-[40%] rounded-md bg-black/50",
                      {
                        hidden: oneColumn,
                        block: !oneColumn,
                      }
                    )}
                  ></div>
                </div>
              </div>
            </>
          ))}
      </Grid>
      <LoadMore
        isLoading={isLoading}
        hasMore={hasMore}
        setPage={setPage}
        empty={records.length === 0}
      />
    </div>
  );
}
