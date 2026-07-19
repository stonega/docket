import BackButton from "@/components/back-button";
import ExcerptCard from "@/components/excerpt-card";
import { getArticleBucketAsync } from "@/lib/article-storage";
import { getArticleReaderData } from "@/lib/article-service";
import { ApiError } from "@/lib/api";
import { getDbAsync } from "@/lib/prisma";
import { dateFromNow, formateDate } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fraunces } from "@/app/fonts";
import ArticleActions from "./article-actions";
import ArticleContent from "./article-content";
import ArticleCover from "./article-cover";
import VersionSelector from "./version-selector";

export default async function ArticleReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ version?: string | string[] }>;
}) {
  const { userId } = await auth();
  if (!userId) notFound();
  const { id } = await params;
  const query = await searchParams;
  const versionId = typeof query.version === "string" ? query.version : undefined;

  let reader;
  try {
    reader = await getArticleReaderData({
      db: await getDbAsync(),
      bucket: await getArticleBucketAsync(),
      userId,
      articleId: id,
      versionId,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { detail, selectedVersion, selectedMetadata, html, contentUnavailable } = reader;
  const historical = !selectedVersion.isCurrent;
  const byline = [selectedMetadata.author, selectedMetadata.siteName ?? detail.site.title]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="relative min-h-full w-full grow overflow-x-clip text-stone-950 dark:text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(167,243,208,0.34),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(6,95,70,0.18),transparent_62%)]"
      />
      <div className="container relative mx-auto px-4 pb-16 pt-3 sm:px-6 sm:pb-24">
        <nav className="library-enter sticky top-[50px] z-10 mx-auto flex min-h-12 max-w-6xl items-center justify-between gap-3 border border-stone-200/90 bg-white/85 p-1.5 shadow-[0_8px_30px_rgba(28,25,23,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0a2328]/85">
          <BackButton>
            <span>Library</span>
          </BackButton>
          <div className="flex min-w-0 items-center gap-1">
            <VersionSelector
              articleId={detail.id}
              selectedVersion={selectedVersion}
              initialVersions={detail.versions}
              total={detail.versionCount}
            />
            <a
              href={selectedMetadata.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="library-motion flex min-h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-medium text-stone-600 outline-none transition-colors duration-150 hover:bg-emerald-50 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-emerald-400 dark:text-stone-300 dark:hover:bg-white/[0.07] dark:hover:text-white motion-reduce:transition-none"
            >
              <span className="hidden sm:inline">Original source</span>
              <ArrowTopRightIcon className="size-3.5" />
            </a>
          </div>
        </nav>

        {historical && (
          <div className="library-enter mx-auto mt-5 flex max-w-6xl flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
            <p>
              You are reading a historical snapshot saved {dateFromNow(selectedVersion.savedAt)}.
            </p>
            <Link
              href={`/home/article/${detail.id}`}
              className="shrink-0 rounded-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              Return to current
            </Link>
          </div>
        )}

        <div className="mx-auto mt-6 max-w-6xl">
          <div className="min-w-0">
            <header className="library-enter overflow-hidden border border-emerald-200/90 bg-emerald-50/90 shadow-[0_1px_2px_rgba(6,78,59,0.04),0_20px_60px_rgba(6,78,59,0.05)] dark:border-emerald-900/80 dark:bg-[#14231f]/95">
              {selectedMetadata.imageUrl && (
                <ArticleCover src={selectedMetadata.imageUrl} />
              )}
              <div className="p-6 sm:p-9">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                  Saved article
                </p>
                <h1 className={`${fraunces.className} mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl`}>
                  {selectedMetadata.title}
                </h1>
                {byline && <p className="mt-4 text-sm text-stone-600 dark:text-stone-300">{byline}</p>}
                {selectedMetadata.description && (
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300 sm:text-base">
                    {selectedMetadata.description}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-200/80 pt-5 dark:border-emerald-900">
                  <div className="flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span>{selectedMetadata.wordCount.toLocaleString()} words</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={selectedVersion.savedAt} title={formateDate(selectedVersion.savedAt)}>
                      Saved {dateFromNow(selectedVersion.savedAt)}
                    </time>
                  </div>
                  <ArticleActions
                    articleId={detail.id}
                    selectedVersionId={selectedVersion.id}
                    historical={historical}
                  />
                </div>
              </div>
            </header>

            <section className="library-enter library-enter-delay mt-6 border border-stone-200 bg-white px-5 py-7 shadow-[0_8px_40px_rgba(28,25,23,0.04)] dark:border-white/10 dark:bg-[#171417] sm:px-10 sm:py-12">
              {contentUnavailable || html === null ? (
                <div className="border border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center dark:border-amber-800 dark:bg-amber-950/30" role="status">
                  <h2 className="text-lg font-semibold">Saved content is temporarily unavailable</h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-stone-600 dark:text-stone-300">
                    The article metadata and version history are intact, but this stored body could not be read from private storage.
                  </p>
                </div>
              ) : (
                <ArticleContent html={html} />
              )}
            </section>

            <section className="library-enter library-enter-delay mt-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-excerpts-700 dark:text-excerpts-300">
                    Reading notes
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">Associated excerpts</h2>
                </div>
                <span className="text-xs tabular-nums text-stone-500 dark:text-stone-400">
                  {detail.excerptCount}
                </span>
              </div>
              {detail.excerpts.length === 0 ? (
                <div className="border border-dashed border-excerpts-300 bg-excerpts-50/70 px-6 py-10 text-center text-sm text-stone-600 dark:border-excerpts-800 dark:bg-excerpts-950/20 dark:text-stone-300">
                  Excerpts saved from this URL will be linked here automatically.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {detail.excerpts.map((excerpt) => (
                    <article key={excerpt.id} className="border border-excerpts-200 bg-excerpts-50 p-5 dark:border-excerpts-900 dark:bg-[#241d25]">
                      <ExcerptCard excerpt={excerpt} variant="compact" />
                      <a
                        href={excerpt.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 outline-none hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-excerpts-400 dark:text-stone-400 dark:hover:text-white"
                      >
                        Original source <ArrowTopRightIcon className="size-3" />
                      </a>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
