import { Dispatch, SetStateAction } from "react";

interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  setPage: Dispatch<SetStateAction<number>>;
}
export function LoadMore({ hasMore, isLoading, setPage }: LoadMoreProps) {
  if (hasMore) return;
  <div className="my-4 w-full text-center text-lg opacity-70 dark:text-white">
    No more records
  </div>;
  if (isLoading)
    return (
      <div className="dot-loader my-4 w-full text-center text-lg opacity-70 dark:text-white">
        Loading
      </div>
    );
  return (
    <div
      className="my-4 w-full cursor-pointer text-center text-lg opacity-70 dark:text-white"
      onClick={() => {
        if (hasMore) setPage((page) => page + 1);
      }}
    >
      Load more
    </div>
  );
}
