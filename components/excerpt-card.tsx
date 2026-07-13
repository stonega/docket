import { Excerpt } from "@prisma/client";
import parse from "html-react-parser";
import Highlight from "react-highlight";

export default function ExcerptCard({ excerpt }: { excerpt: Excerpt }) {
  if (excerpt.content.startsWith("<pre>"))
    return (
      <div className="excerpt-card w-full bg-yellow-100">
        <Highlight>{parse(excerpt.content)}</Highlight>
      </div>
    );
  return (
    <article className="excerpt-card prose prose-stone lg:prose-xl dark:prose-invert prose-code:bg-orange-200 prose-code:before:content-[] prose-code:after:content-[] prose-code:px-1 prose-code:py-1 prose-code:text-stone-600 prose-code:rounded-lg prose-a:text-yellow-600">
      {parse(excerpt.content)}
    </article>
  );
}
