import { ExternalLinkIcon } from "@radix-ui/react-icons";
import ExcerptCard from "@/components/excerpt-card";
import { dateFromNow, formateDate } from "@/lib/utils";
import type { ExcerptWithArticle } from "@/types/library";
import Link from "next/link";

interface ExcerptPreviewProps {
  excerpt: ExcerptWithArticle;
  animationIndex?: number;
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ExcerptPreview({
  excerpt,
  animationIndex = 0,
}: ExcerptPreviewProps) {
  const sourceLabel = excerpt.source?.trim() || getHostname(excerpt.url);

  return (
    <article
      className="group/excerpt library-card-enter w-full break-inside-avoid overflow-hidden rounded-2xl border border-excerpts-200/90 bg-excerpts-50 shadow-[0_1px_2px_rgba(59,24,59,0.04)] transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-excerpts-300 hover:bg-white hover:shadow-[0_12px_30px_rgba(59,24,59,0.07)] dark:border-excerpts-900/80 dark:bg-[#241d25] dark:hover:border-excerpts-800 dark:hover:bg-[#2a222b] motion-reduce:transition-none"
      style={{ animationDelay: `${Math.min(animationIndex, 8) * 32}ms` }}
    >
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-excerpts-500" />
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-excerpts-800 dark:text-excerpts-300">
            Excerpt
          </span>
        </div>
        <ExcerptCard excerpt={excerpt} variant="compact" />
      </div>

      <footer className="flex min-h-11 items-center justify-between gap-3 border-t border-excerpts-200/90 px-3 py-2 text-xs text-stone-500 dark:border-excerpts-900 dark:text-stone-400">
        {excerpt.article ? (
          <Link
            href={`/home/article/${excerpt.article.id}`}
            className="min-w-0 truncate rounded-lg px-2 py-1.5 font-medium text-excerpts-800 outline-none transition-colors duration-150 hover:bg-excerpts-100 hover:text-excerpts-950 focus-visible:ring-2 focus-visible:ring-excerpts-400 dark:text-excerpts-200 dark:hover:bg-white/[0.06] dark:hover:text-white motion-reduce:transition-none"
          >
            Read in {excerpt.article.title}
          </Link>
        ) : (
          <time
            className="px-2"
            dateTime={excerpt.createAt}
            title={formateDate(excerpt.createAt)}
          >
            {dateFromNow(excerpt.createAt)}
          </time>
        )}
        <a
          href={excerpt.url}
          target="_blank"
          rel="noreferrer"
          title={`Open ${sourceLabel}`}
          aria-label={`Open original source: ${sourceLabel}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg outline-none transition-colors duration-150 hover:bg-excerpts-100 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-excerpts-400 dark:hover:bg-white/[0.06] dark:hover:text-white motion-reduce:transition-none"
        >
          <ExternalLinkIcon className="size-3.5" />
        </a>
      </footer>
    </article>
  );
}
