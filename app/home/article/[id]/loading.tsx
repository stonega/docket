export default function Loading() {
  return (
    <main className="container mx-auto w-full px-4 py-8 sm:px-6" aria-busy="true">
      <div className="mx-auto max-w-6xl animate-pulse motion-reduce:animate-none">
        <div className="h-12 rounded-2xl bg-stone-200/70 dark:bg-white/[0.06]" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <div className="h-80 rounded-3xl bg-emerald-100 dark:bg-emerald-950/40" />
            <div className="mt-6 h-[40rem] rounded-3xl bg-stone-100 dark:bg-white/[0.04]" />
          </div>
          <div className="h-80 rounded-2xl bg-stone-100 dark:bg-white/[0.04]" />
        </div>
      </div>
    </main>
  );
}
