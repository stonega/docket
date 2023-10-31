"use client";
import { useExcerpts } from "@/hooks/use-api";
import Excerpt from "./excerpt";

const ExcerptsList = ({ siteId }: { siteId: string }) => {
  const { data, isLoading, mutate } = useExcerpts(1, 999, { siteId });

  return (
    <>
      <div className="flex flex-col">
        {data &&
          data.map((excerpt) => (
            <Excerpt excerpt={excerpt} key={excerpt.id} onDelete={mutate} />
          ))}
        {isLoading && (
          <>
            <div className="flex animate-pulse flex-col space-y-2">
              <div className="mt-2 h-4 w-[20%] rounded-md bg-black/50"></div>
              <div className="text-md mt-2 h-4 w-full rounded-md bg-black/50"></div>
              <div className="mt-2 h-4 w-[60%] rounded-md bg-black/50"></div>
              <div className="mt-2 h-4 w-[30%] rounded-md bg-black/50"></div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ExcerptsList;
