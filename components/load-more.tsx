import { Dispatch, SetStateAction } from "react";

interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  setPage: Dispatch<SetStateAction<number>>;
}
export function LoadMore({
  hasMore,
  isLoading,
  setPage,
}: LoadMoreProps) {
  if (isLoading)
    return (
      <div
        className="mx-auto my-5 w-fit px-2 py-2 text-center text-xs text-stone-500 dark:text-stone-400"
        role="status"
      >
        Loading more
      </div>
    );
  if (!hasMore) return null;

  return (
    <button
      type="button"
      className="library-motion mx-auto my-5 w-fit border-0 bg-transparent px-2 py-2 text-center text-xs font-medium text-stone-500 underline-offset-4 transition-[color,transform] duration-150 ease-out hover:text-stone-950 hover:underline focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-excerpts-400 focus-visible:ring-offset-2 active:translate-y-px dark:text-stone-400 dark:hover:text-white dark:focus-visible:ring-offset-[#111] motion-reduce:transition-none"
      onClick={() => {
        if (hasMore) setPage((page) => page + 1);
      }}
    >
      Load more
    </button>
  );
}
