"use client";
import { Excerpt } from "@prisma/client";
import ExcerptItem from "./excerpt";

function ExcerptsList({
  excerpts,
  siteUrl,
}: {
  excerpts: Excerpt[];
  siteUrl: string;
}) {
  return (
    <>
      <div className="flex flex-col">
        {excerpts &&
          excerpts.map((excerpt) => (
            <ExcerptItem
              excerpt={excerpt}
              key={excerpt.id}
              siteUrl={siteUrl} 
              onDelete={function (): void {
                throw new Error("Function not implemented.");
              } }              // onDelete={mutate}
            />
          ))}
      </div>
    </>
  );
}

export default ExcerptsList;
