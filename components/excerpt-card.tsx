import CodeHighlight from "@/components/code-highlight";
import parse from "html-react-parser";
import classnames from "classnames";

interface ExcerptCardProps {
  excerpt: { content: string };
  variant?: "default" | "compact" | "reader";
}

export default function ExcerptCard({
  excerpt,
  variant = "default",
}: ExcerptCardProps) {
  if (excerpt.content.startsWith("<pre>"))
    return (
      <div
        className={classnames(
          "excerpt-card w-full overflow-hidden rounded-xl bg-yellow-100",
          {
            "excerpt-card--compact": variant === "compact",
            "excerpt-card--reader": variant === "reader",
          },
        )}
      >
        <CodeHighlight html={excerpt.content} />
      </div>
    );

  return (
    <article
      className={classnames(
        "excerpt-card prose prose-stone max-w-none dark:prose-invert prose-code:rounded-lg prose-code:bg-orange-200 prose-code:px-1 prose-code:py-1 prose-code:text-stone-600 prose-code:before:content-[] prose-code:after:content-[] prose-a:text-yellow-700 dark:prose-a:text-yellow-400",
        {
          "excerpt-card--compact prose-sm prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-li:my-0.5":
            variant === "compact",
          "excerpt-card--reader prose-base leading-7 prose-headings:mb-3 prose-headings:mt-6 prose-p:my-3 prose-li:my-1 sm:prose-lg":
            variant === "reader",
          "lg:prose-xl": variant === "default",
        },
      )}
    >
      {parse(excerpt.content)}
    </article>
  );
}
