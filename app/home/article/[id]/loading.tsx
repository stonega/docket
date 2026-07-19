export default function Loading() {
  return (
    <main className="container mx-auto w-full px-4 py-8 sm:px-6" aria-busy="true">
      <div className="mx-auto max-w-6xl animate-pulse motion-reduce:animate-none">
        <div className="h-12 bg-stone-200/70 dark:bg-white/[0.06]" />
        <div className="mt-6">
          <div className="h-80 bg-emerald-100 dark:bg-emerald-950/40" />
          <div className="mt-6 h-[40rem] bg-stone-100 dark:bg-white/[0.04]" />
        </div>
      </div>
    </main>
  );
}
