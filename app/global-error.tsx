"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-stone-50 px-4 text-stone-950 dark:bg-[#111] dark:text-white">
        <main className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-[#171417]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Docket
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
            Your saved library has not been changed. Try loading this view again or return home.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="min-h-11 rounded-xl bg-stone-950 px-5 text-sm font-semibold text-white outline-none transition-colors duration-150 hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-yellow-400 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200 motion-reduce:transition-none"
            >
              Try again
            </button>
            <Link
              href="/"
              className="flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-5 text-sm font-semibold outline-none transition-colors duration-150 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-yellow-400 dark:border-white/15 dark:hover:bg-white/[0.06] motion-reduce:transition-none"
            >
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
