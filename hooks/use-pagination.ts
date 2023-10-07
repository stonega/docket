import { useEffect, useState } from "react";
import { UseApi } from "./use-api";

export function usePagination<T extends { id: string }>(
  useApi: UseApi<T>,
  options?: {
    [key: string]: string;
  }
) {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, error } = useApi(page, 20, options);

  useEffect(() => {
    console.log(data);
    if (!data) return;
    if (data.length > 0) {
      setRecords((records) => {
        data.forEach((item) => {
          if (!records.find((record) => item.id === record.id)) {
            records = [...records, item];
          }
        });
        return records;
      });
    } else {
      setHasMore(false);
    }
  }, [data]);
  return {
    setPage,
    records,
    hasMore,
    isLoading,
    error,
  };
}
