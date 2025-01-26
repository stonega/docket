import { Dispatch, SetStateAction } from "react";

interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  empty: boolean;
  setPage: Dispatch<SetStateAction<number>>;
}
export function LoadMore({
  hasMore,
  isLoading,
  setPage,
  empty,
}: LoadMoreProps) {
  if (!hasMore)
    return (
      <div className="rounded-md border border-black mx-auto my-4 px-2 py-2 w-fit text-center text-sm dark:text-white">
        No more data
      </div>
    );
  if (isLoading)
    return (
      <div className="dot-loader mx-auto my-4 w-fit text-center text-lg opacity-70 dark:text-white">
        Loading
      </div>
    );
  if (empty)
    return (
      <div className="rounded-md dot-loader mx-auto py-2 my-4 w-fit text-center text-sm dark:text-white">
        No data
      </div>
    );
  return (
    <div
      className="rounded-md hover:bg-[#ff90e8] border border-black w-fit my-4 py-2 text-sm px-2 mx-auto cursor-pointer text-center dark:text-white"
      onClick={() => {
        if (hasMore) setPage((page) => page + 1);
      }}
    >
      Load more
    </div>
  );
}
