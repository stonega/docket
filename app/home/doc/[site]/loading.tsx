import BackButton from "@/components/back-button";

export default function Loading() {
  return (
    <main className="relative flex min-h-full w-full grow flex-col overflow-x-clip text-stone-950 dark:text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,rgba(243,227,212,0.72),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(121,70,52,0.16),transparent_62%)]"
      />
      <div className="container relative mx-auto w-full px-4 pb-14 pt-3 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <nav className="flex min-h-12 items-center justify-between border border-stone-200/90 bg-white/85 p-1.5 shadow-[0_8px_30px_rgba(28,25,23,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0a2328]/85">
            <BackButton>
              <span>Library</span>
            </BackButton>
            <div className="flex items-center gap-2" aria-hidden="true">
              <div className="h-8 w-24 animate-pulse rounded-xl bg-stone-100 dark:bg-white/10 motion-reduce:animate-none" />
              <div className="size-8 animate-pulse rounded-xl bg-stone-100 dark:bg-white/10 motion-reduce:animate-none" />
            </div>
          </nav>

          <div className="mt-6 animate-pulse border border-sites-200/90 bg-sites-50/90 p-6 dark:border-sites-900/80 dark:bg-[#261f1d]/95 sm:p-8 motion-reduce:animate-none">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-7">
              <div className="size-16 shrink-0 rounded-2xl bg-sites-200 dark:bg-white/10 sm:size-20" />
              <div className="min-w-0 grow pt-1">
                <div className="h-2.5 w-28 rounded-full bg-sites-200 dark:bg-white/10" />
                <div className="mt-4 h-8 w-3/4 rounded-xl bg-sites-200 dark:bg-white/10 sm:h-10 sm:w-1/2" />
                <div className="mt-4 h-3 w-full max-w-xl rounded-full bg-sites-200/80 dark:bg-white/[0.08]" />
                <div className="mt-2 h-3 w-2/3 max-w-md rounded-full bg-sites-200/80 dark:bg-white/[0.08]" />
                <div className="mt-5 flex gap-2">
                  <div className="h-6 w-20 rounded-full bg-sites-200 dark:bg-white/10" />
                  <div className="h-6 w-28 rounded-full bg-sites-200 dark:bg-white/10" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="h-2.5 w-24 animate-pulse rounded-full bg-excerpts-200 dark:bg-white/10 motion-reduce:animate-none" />
            <div className="mt-3 h-7 w-40 animate-pulse rounded-lg bg-stone-200 dark:bg-white/10 motion-reduce:animate-none" />
            <div className="mt-5 flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  aria-hidden="true"
                  className="min-h-52 w-full animate-pulse border border-excerpts-200/90 bg-white p-6 dark:border-excerpts-900 dark:bg-[#171417] motion-reduce:animate-none"
                  key={index}
                >
                  <div className="h-3 w-20 rounded-full bg-excerpts-100 dark:bg-white/10" />
                  <div className="mt-8 h-3 w-full rounded-full bg-stone-100 dark:bg-white/10" />
                  <div className="mt-3 h-3 w-5/6 rounded-full bg-stone-100 dark:bg-white/10" />
                  <div className="mt-3 h-3 w-2/3 rounded-full bg-stone-100 dark:bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
