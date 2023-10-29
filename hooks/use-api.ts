import useSWR, { useSWRConfig } from "swr";
import queryString from "query-string";
import { Excerpt, Site } from "@prisma/client";
import { useCallback, useMemo } from "react";
export type UseApi<T> = (
  page: number,
  pageSize: number,
  options?: {
    [key: string]: string;
  }
) => {
  data: T[] | undefined;
  isLoading: boolean;
  error: any;
};
export function useSites(page: number, pageSize: number) {
  const url = queryString.stringify({ page, page_size: pageSize });
  const request = async (): Promise<Site[]> => {
    const response = await fetch(`/api/site?${url}`);
    const result = await response.json();
    return result;
  };

  const { data, error, isLoading } = useSWR(() => `/api/site?${url}`, request);
  return {
    data,
    isLoading,
    error,
  };
}

export function useExcerpts(
  page: number,
  pageSize: number,
  options?: {
    [key: string]: string;
  }
) {
  const { mutate: swrMutate } = useSWRConfig();
  const url = useMemo(
    () =>
      queryString.stringify({
        page,
        page_size: pageSize,
        site_id: options?.siteId,
      }),
    [page, pageSize, options]
  );
  const request = async (): Promise<Excerpt[]> => {
    const response = await fetch(`/api/excerpt?${url}`);
    const result = await response.json();
    return result;
  };

  const { data, error, isLoading } = useSWR(
    options?.siteId ? `/api/excerpt?${url}` : null,
    request
  );

  const mutate = useCallback(() => swrMutate(`/api/excerpt?${url}`), [swrMutate, url]);

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}
