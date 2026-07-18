"use client";
import { Site } from "@prisma/client";
import { ArrowRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { dateFromNow, formateDate } from "@/lib/utils";

interface SiteCardProps {
  site: Site;
  animationIndex?: number;
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function SiteCard({ site, animationIndex = 0 }: SiteCardProps) {
  const [imageError, setImageError] = useState(false);
  const placeholderText = site.title.trim().charAt(0).toUpperCase() || "D";
  const hostname = getHostname(site.url);
  const hasImage = Boolean(site.icon) && !imageError;

  return (
    <article
      className="group/site library-card-enter flex min-h-56 w-full flex-col overflow-hidden rounded-2xl border border-sites-200/90 bg-sites-50 text-stone-950 shadow-[0_1px_2px_rgba(64,34,24,0.04)] transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-sites-300 hover:bg-sites-100/70 hover:shadow-[0_12px_30px_rgba(64,34,24,0.08)] dark:border-sites-900/80 dark:bg-[#261f1d] dark:text-white dark:hover:border-sites-800 dark:hover:bg-[#2d2421] motion-reduce:transition-none"
      style={{ animationDelay: `${Math.min(animationIndex, 8) * 32}ms` }}
    >
      <Link
        href={`/home/doc/${site.id}`}
        className="flex grow flex-col p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400"
      >
        <span className="flex w-full items-start justify-between gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sites-200 bg-white shadow-sm dark:border-sites-800 dark:bg-white/10">
            {hasImage ? (
              <Image
                alt=""
                src={site.icon}
                unoptimized
                width={32}
                height={32}
                className="size-8 object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-full items-center justify-center bg-yellow-200 text-sm font-bold text-stone-800 dark:bg-yellow-800 dark:text-yellow-50"
              >
                {placeholderText}
              </span>
            )}
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sites-200 bg-white/70 text-stone-500 transition-[color,background-color,transform] duration-150 ease-out group-hover/site:translate-x-0.5 group-hover/site:bg-white group-hover/site:text-stone-950 dark:border-sites-800 dark:bg-white/[0.06] dark:text-stone-400 dark:group-hover/site:bg-white/10 dark:group-hover/site:text-white motion-reduce:transition-none">
            <ArrowRightIcon className="size-4" />
          </span>
        </span>

        <span className="mt-5 line-clamp-2 text-base font-semibold leading-6 tracking-[-0.01em]">
          {site.title}
        </span>
        <span className="mt-2 line-clamp-2 text-[0.8125rem] leading-5 text-stone-600 dark:text-stone-300">
          {site.description || "Saved for quick access in your Docket library."}
        </span>
      </Link>

      <a
        href={site.url}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-11 w-full items-center justify-between gap-3 border-t border-sites-200/90 px-5 py-3 text-xs text-stone-500 outline-none transition-colors duration-150 hover:bg-white/60 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400 dark:border-sites-900 dark:text-stone-400 dark:hover:bg-white/[0.05] dark:hover:text-white motion-reduce:transition-none"
      >
        <span className="min-w-0 truncate">{hostname}</span>
        <span className="flex shrink-0 items-center gap-2">
          <time
            dateTime={site.updateAt.toString()}
            title={formateDate(site.updateAt.toString())}
          >
            {dateFromNow(site.updateAt.toString())}
          </time>
          <ExternalLinkIcon className="size-3.5" />
        </span>
      </a>
    </article>
  );
}
