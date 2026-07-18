import BackButton from "@/components/back-button";
import ExcerptsList from "./excerpts-list";
import { getDbAsync } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import MenuDropdown from "./menu";
import Title from "./title";
import SiteIcon from "./site-icon";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { dateFromNow, formateDate } from "@/lib/utils";
import ArticlesList from "./articles-list";

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const siteId = (await params).site;
  const { userId } = await auth();
  if (!userId) notFound();

  const db = await getDbAsync();
  const site = await db.site.findFirst({
    where: { id: siteId, userId },
  });
  if (!site) notFound();

  const [excerpts, articleCount] = await Promise.all([
    db.excerpt.findMany({
      where: { siteId, userId },
      include: { article: { select: { id: true, title: true } } },
      orderBy: { createAt: "asc" },
    }),
    db.article.count({ where: { siteId, userId, status: "ACTIVE" } }),
  ]);

  const hostname = getHostname(site.url);
  const excerptLabel =
    excerpts.length === 1 ? "1 excerpt" : `${excerpts.length} excerpts`;
  const articleLabel =
    articleCount === 1 ? "1 article" : `${articleCount} articles`;

  return (
    <main className="relative flex min-h-full w-full grow flex-col overflow-x-clip text-stone-950 dark:text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,rgba(243,227,212,0.72),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(121,70,52,0.16),transparent_62%)]"
      />

      <div className="container relative mx-auto w-full px-4 pb-14 pt-3 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <nav
            aria-label="Document controls"
            className="library-enter sticky top-[50px] z-10 flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white/85 p-1.5 shadow-[0_8px_30px_rgba(28,25,23,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0a2328]/85"
          >
            <BackButton>
              <span>Library</span>
            </BackButton>

            <span className="pointer-events-none absolute left-1/2 hidden max-w-[40%] -translate-x-1/2 truncate text-xs font-medium text-stone-500 dark:text-stone-400 sm:block">
              {site.title}
            </span>

            <div className="flex items-center gap-1">
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="library-motion flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium text-stone-600 transition-[color,background-color,transform] duration-150 ease-out hover:bg-sites-50 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 active:scale-[0.98] dark:text-stone-300 dark:hover:bg-white/[0.07] dark:hover:text-white motion-reduce:transition-none"
              >
                <span className="hidden sm:inline">Open source</span>
                <ExternalLinkIcon className="size-4" />
              </a>
              <MenuDropdown siteId={site.id} />
            </div>
          </nav>

          <header className="library-enter library-enter-delay mt-6 rounded-3xl border border-sites-200/90 bg-sites-50/90 p-6 shadow-[0_1px_2px_rgba(64,34,24,0.04),0_20px_60px_rgba(64,34,24,0.05)] dark:border-sites-900/80 dark:bg-[#261f1d]/95 sm:p-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-7">
              <SiteIcon icon={site.icon} title={site.title} />
              <div className="min-w-0 grow pt-0.5">
                <p className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-sites-700 dark:text-sites-300">
                  {hostname}
                </p>
                <Title site={site} />
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                  {site.description ||
                    "A saved source and the excerpts you want to return to."}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <span className="rounded-full border border-sites-200 bg-white/70 px-2.5 py-1 dark:border-sites-800 dark:bg-white/[0.06]">
                    {excerptLabel}
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-white/70 px-2.5 py-1 dark:border-emerald-800 dark:bg-white/[0.06]">
                    {articleLabel}
                  </span>
                  <time
                    dateTime={site.updateAt.toString()}
                    title={formateDate(site.updateAt.toString())}
                    className="rounded-full border border-sites-200 bg-white/70 px-2.5 py-1 dark:border-sites-800 dark:bg-white/[0.06]"
                  >
                    Updated {dateFromNow(site.updateAt.toString())}
                  </time>
                </div>
              </div>
            </div>
          </header>

          <ArticlesList siteId={siteId} total={articleCount} />
          <ExcerptsList excerpts={excerpts} siteUrl={site.url} />
        </div>
      </div>
    </main>
  );
}
