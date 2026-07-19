"use client";

import type { ArticleSummary } from "@/types/library";
import { ArrowRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useState } from "react";
import { dateFromNow, formateDate } from "@/lib/utils";

export default function ArticleCard({
  article,
  animationIndex = 0,
}: {
  article: ArticleSummary;
  animationIndex?: number;
}) {
  const [coverFailed, setCoverFailed] = useState(false);
  const byline = [article.author, article.siteName ?? article.site.title]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className="group/article library-card-enter flex h-full min-h-72 w-full flex-col overflow-hidden border border-emerald-200/90 bg-emerald-50 shadow-[0_1px_2px_rgba(6,78,59,0.04)] transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-emerald-300 hover:bg-white hover:shadow-[0_14px_36px_rgba(6,78,59,0.08)] dark:border-emerald-900/80 dark:bg-[#14231f] dark:hover:border-emerald-800 dark:hover:bg-[#182a25] motion-reduce:transition-none"
      style={{ animationDelay: `${Math.min(animationIndex, 8) * 32}ms` }}
    >
      {article.imageUrl && !coverFailed ? (
        <div className="aspect-[16/8] overflow-hidden border-b border-emerald-200/80 bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60">
          {/* The source controls this remote URL; referrer data is deliberately withheld. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-full object-cover transition-transform duration-200 ease-out group-hover/article:scale-[1.015] motion-reduce:transition-none"
            onError={() => setCoverFailed(true)}
          />
        </div>
      ) : (
        <div className="flex aspect-[16/5] items-center justify-center border-b border-emerald-200/80 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_65%)] dark:border-emerald-900">
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-300">
            Saved article
          </span>
        </div>
      )}

      <Link
        href={`/home/article/${article.id}`}
        className="flex grow flex-col p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
      >
        <span className="flex items-start justify-between gap-4">
          <span className="line-clamp-3 text-base font-semibold leading-6 tracking-[-0.015em] text-stone-950 dark:text-white">
            {article.title}
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white/70 text-stone-500 transition-transform duration-150 ease-out group-hover/article:translate-x-0.5 dark:border-emerald-800 dark:bg-white/[0.06] dark:text-stone-300 motion-reduce:transition-none">
            <ArrowRightIcon className="size-4" />
          </span>
        </span>
        {byline && (
          <span className="mt-2 line-clamp-1 text-xs text-stone-500 dark:text-stone-400">
            {byline}
          </span>
        )}
        <span className="mt-auto flex flex-wrap gap-1.5 pt-5 text-[0.6875rem] text-stone-500 dark:text-stone-400">
          <span className="rounded-full border border-emerald-200 bg-white/70 px-2 py-1 dark:border-emerald-900 dark:bg-white/[0.04]">
            {article.wordCount.toLocaleString()} words
          </span>
          <span className="rounded-full border border-emerald-200 bg-white/70 px-2 py-1 dark:border-emerald-900 dark:bg-white/[0.04]">
            {article.versionCount} {article.versionCount === 1 ? "version" : "versions"}
          </span>
          <span className="rounded-full border border-emerald-200 bg-white/70 px-2 py-1 dark:border-emerald-900 dark:bg-white/[0.04]">
            {article.excerptCount} {article.excerptCount === 1 ? "excerpt" : "excerpts"}
          </span>
        </span>
      </Link>

      <a
        href={article.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-11 items-center justify-between gap-3 border-t border-emerald-200/90 px-5 py-3 text-xs text-stone-500 outline-none transition-colors duration-150 hover:bg-emerald-100/60 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400 dark:border-emerald-900 dark:text-stone-400 dark:hover:bg-white/[0.04] dark:hover:text-white motion-reduce:transition-none"
      >
        <time
          dateTime={article.updatedAt}
          title={formateDate(article.updatedAt)}
        >
          Saved {dateFromNow(article.updatedAt)}
        </time>
        <span className="flex shrink-0 items-center gap-1.5">
          Original <ExternalLinkIcon className="size-3.5" />
        </span>
      </a>
    </article>
  );
}
