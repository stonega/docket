"use client";

import { useConfirmModal } from "@/components/confirm-modal";
import ExcerptCard from "@/components/excerpt-card";
import { dateFromNow, formateDate } from "@/lib/utils";
import type { Prisma } from "@prisma/client";
import { ArrowTopRightIcon, TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

type ExcerptType = Prisma.ExcerptGetPayload<{
  include: { article: { select: { id: true; title: true } } };
}>;

function getSourceLabel(excerptUrl: string, siteUrl: string) {
  if (excerptUrl === siteUrl) return "Original page";

  try {
    const excerpt = new URL(excerptUrl);
    const site = new URL(siteUrl);
    if (excerpt.origin === site.origin) {
      return `${excerpt.pathname}${excerpt.search}${excerpt.hash}` || "/";
    }
    return `${excerpt.hostname.replace(/^www\./, "")}${excerpt.pathname}`;
  } catch {
    return excerptUrl;
  }
}

export default function Excerpt({
  excerpt,
  siteUrl,
  index,
}: {
  excerpt: ExcerptType;
  siteUrl: string;
  index: number;
}) {
  const router = useRouter();
  const { setShowConfirmModal, ConfirmModal } = useConfirmModal(async () => {
    const response = await fetch("/api/excerpt", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: excerpt.id }),
    });
    if (!response.ok) throw new Error("The excerpt could not be deleted");

    toast.success("Excerpt deleted");
    router.refresh();
  }, "Delete excerpt");
  const sourceLabel = getSourceLabel(excerpt.url, siteUrl);

  return (
    <>
      <ConfirmModal>
        Are you sure you want to delete this excerpt? Deleting this excerpt is
        permanent and cannot be undone.
      </ConfirmModal>
      <article
        className="group/excerpt library-card-enter overflow-hidden border border-excerpts-200/90 bg-white shadow-[0_1px_2px_rgba(59,24,59,0.04)] transition-[border-color,box-shadow] duration-200 ease-out hover:border-excerpts-300 hover:shadow-[0_14px_40px_rgba(59,24,59,0.07)] dark:border-excerpts-900/80 dark:bg-[#171417] dark:hover:border-excerpts-800 motion-reduce:transition-none"
        style={{ animationDelay: `${Math.min(index, 8) * 32}ms` }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-excerpts-100 bg-excerpts-50/60 px-5 py-3 dark:border-excerpts-950 dark:bg-excerpts-950/20 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-excerpts-100 px-1 text-[0.625rem] font-semibold tabular-nums text-excerpts-800 dark:bg-excerpts-950 dark:text-excerpts-200">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-excerpts-700 dark:text-excerpts-300">
              Excerpt
            </span>
          </div>
          <time
            dateTime={excerpt.createAt.toString()}
            title={formateDate(excerpt.createAt.toString())}
            className="text-xs text-stone-500 dark:text-stone-400"
          >
            {dateFromNow(excerpt.createAt.toString())}
          </time>
        </div>

        <div className="px-5 py-6 sm:px-7 sm:py-8">
          <div className="mx-auto max-w-3xl">
            <ExcerptCard excerpt={excerpt} variant="reader" />
          </div>
        </div>

        <footer className="flex min-h-12 items-center justify-between gap-4 border-t border-excerpts-100 px-5 py-2.5 dark:border-excerpts-950 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {excerpt.article && (
              <Link
                href={`/home/article/${excerpt.article.id}`}
                className="min-w-0 truncate rounded-lg px-2 py-1 text-xs font-semibold text-excerpts-800 outline-none transition-colors duration-150 hover:bg-excerpts-50 hover:text-excerpts-950 focus-visible:ring-2 focus-visible:ring-excerpts-400 dark:text-excerpts-200 dark:hover:bg-white/[0.06] dark:hover:text-white motion-reduce:transition-none"
              >
                Read in {excerpt.article.title}
              </Link>
            )}
            <a
              href={excerpt.url}
              target="_blank"
              rel="noreferrer"
              title={excerpt.url}
              aria-label={`Open original source: ${sourceLabel}`}
              className="group/source flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium text-stone-500 outline-none transition-colors duration-150 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-excerpts-400 dark:text-stone-400 dark:hover:text-white motion-reduce:transition-none"
            >
              {!excerpt.article && <span className="truncate">{sourceLabel}</span>}
              <ArrowTopRightIcon className="size-3.5 shrink-0" />
            </a>
          </div>

          <button
            type="button"
            aria-label="Delete excerpt"
            title="Delete excerpt"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-stone-400 outline-none transition-[color,background-color,transform] duration-150 ease-out hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-400 active:scale-[0.96] dark:text-stone-500 dark:hover:bg-red-950/40 dark:hover:text-red-300 motion-reduce:transition-none"
            onClick={() => setShowConfirmModal(true)}
          >
            <TrashIcon className="size-3.5" />
          </button>
        </footer>
      </article>
    </>
  );
}
