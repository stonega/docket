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
    <div className="grow flex flex-col px-2">
      {excerpts &&
        excerpts.map((excerpt) => (
          <ExcerptItem
            excerpt={excerpt}
            key={excerpt.id}
            siteUrl={siteUrl}
          />
        ))}
    </div>
  );
}

export default ExcerptsList;
