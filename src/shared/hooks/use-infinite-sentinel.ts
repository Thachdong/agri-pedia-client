"use client";

import { useEffect, useState } from "react";

export type TInfiniteSentinelOptions = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  /** Trang kế lỗi → không tự tải lại (tránh vòng lặp gọi lỗi); để người dùng bấm thử lại. */
  isFetchNextPageError: boolean;
  fetchNextPage: () => unknown;
  /** Khung cuộn chứa sentinel (vd. body của dialog); bỏ trống = viewport. */
  root?: React.RefObject<Element | null>;
  /** Tải sớm trước khi sentinel thật sự hiện ra. */
  rootMargin?: string;
};

/**
 * Infinite scroll bằng sentinel: gắn ref trả về vào phần tử cuối danh sách, sentinel lọt vào khung
 * → `fetchNextPage()`. Nhận thẳng các field của kết quả `useAppInfiniteQuery`.
 * Callback ref → sentinel render muộn (sau loading) vẫn được theo dõi.
 */
export function useInfiniteSentinel<TElement extends Element = HTMLDivElement>({
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  fetchNextPage,
  root,
  rootMargin = "200px",
}: TInfiniteSentinelOptions) {
  const [sentinel, setSentinel] = useState<TElement | null>(null);
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;

  useEffect(() => {
    if (!sentinel || !canLoadMore) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && fetchNextPage(), {
      root: root?.current ?? null,
      rootMargin,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, canLoadMore, fetchNextPage, root, rootMargin]);

  return setSentinel;
}
