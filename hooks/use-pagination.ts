import { useEffect, useState } from "react";
import useSwr from "swr";
import queryString from "query-string";

export async function getData<T>(
  path: string,
  page: number,
  pageSize: number,
  options?: {
    [key: string]: string;
  }
): Promise<T[]> {
  const url = queryString.stringify({
    page,
    page_size: pageSize,
    ...options,
  });
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${path}${separator}${url}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const result: unknown = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("Expected a list response");
  }

  return result as T[];
}

export function usePagination<T extends { id: string }>(path: string) {
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<
    | {
        [key: string]: string;
      }
    | undefined
  >();
  const [records, setRecords] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, error } = useSwr<T[]>(
    {
      path,
      page,
      options,
    },
    (key: any) => getData<T>(key.path, key.page, 20, key.options)
  );

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    setRecords([]);
    setHasMore(true);
  }, [options, path]);

  useEffect(() => {
    if (!data) return;
    if (data.length > 0) {
      setRecords((records) => {
        const existingIds = new Set(records.map((record) => record.id));
        return [
          ...records,
          ...data.filter((item) => !existingIds.has(item.id)),
        ];
      });
    }
    setHasMore(data.length === 20);
  }, [data]);

  return {
    setPage,
    records,
    hasMore,
    isLoading,
    setOptions,
    error,
  };
}
