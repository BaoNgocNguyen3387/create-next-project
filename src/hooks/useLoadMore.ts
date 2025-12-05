/* eslint-disable no-unused-vars */
import { InfiniteData, UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';

type QueryKey = readonly unknown[];

interface PageResult<T> {
  data: T[];
  page: number;
}

interface Props<T> {
  queryKey: QueryKey;
  fetchFn: (page: number) => Promise<{ data: T[] }>;
  options?: UseInfiniteQueryOptions<
    PageResult<T>, // TQueryFnData
    Error, // TError
    PageResult<T>, // TData
    QueryKey, // TPageParam
    number // TQueryKey
  >;
}

const defaultOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px',
  threshold: 0,
};

const useLoadMore = <T>(
  queryKey: Props<T>['queryKey'],
  fetchFn: Props<T>['fetchFn'],
  options: Props<T>['options'],
) => {
  const observer = useRef<IntersectionObserver>(null);

  const nodeRef = useCallback((node: Element) => {
    if (!node || !observer.current) return;
    observer.current.observe(node);
  }, []);

  const { data, isFetching, fetchNextPage } = useInfiniteQuery<
    { data: T[]; page: number }, // TQueryFnData
    Error, // TError
    { data: T[]; page: number }, // TData
    QueryKey, // TQueryKey (bắt buộc là array)
    number
  >({
    queryKey,
    initialPageParam: 1, // ⭐ BẮT BUỘC
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const res = await fetchFn(page);
      return { data: res.data, page };
    },
    getNextPageParam: (lastPage) => (lastPage.data.length === 0 ? undefined : lastPage.page + 1),
    ...options,
  });

  const createNewObserver = useCallback(() => {
    return new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && observer.current) {
        fetchNextPage();
        // unobserve when intersecting so that last item will not be observed to fetch again
        observer.current.unobserve(target.target);
      }
    }, defaultOptions);
  }, [fetchNextPage]);

  useEffect(() => {
    if (options?.enabled === false) {
      observer.current = null;
      return;
    }
    observer.current = createNewObserver();
  }, [options?.enabled, createNewObserver]);

  const pageData = useMemo(() => {
    if (!data) return [];

    // data được TS hiểu là InfiniteData<PageResult<T>>
    // return data.pages.flatMap((page: PageResult<T>) => page.data);
  }, [data]);

  return { data: pageData ?? [], isFetching, nodeRef, fetchNextPage };
};

export default useLoadMore;
