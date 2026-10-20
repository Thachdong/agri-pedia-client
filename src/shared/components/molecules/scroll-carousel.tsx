"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Children, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "../atoms";

export type TScrollCarouselProps = {
  /** Mỗi child là một slide (bọc trong <li>, giữ key của child). */
  children: React.ReactNode;
  /** Tên vùng slide cho trình đọc màn hình, vd. "Bài viết nổi bật về Lúa". */
  "aria-label": string;
  /** Kích thước mỗi slide, vd. "w-72". */
  itemClassName?: string;
  className?: string;
};

/** Mỗi lần bấm trượt gần trọn khung nhìn (chừa 1 phần slide cũ để giữ mạch). */
const PAGE_RATIO = 0.9;

/**
 * Slide ngang bằng scroll-snap native (vuốt trên mobile, lăn/kéo trên desktop) + nút trước / sau ở 2 mép,
 * ẩn nút khi đã tới đầu / cuối. Không phụ thuộc thư viện carousel.
 */
export function ScrollCarousel({ children, "aria-label": ariaLabel, itemClassName, className }: TScrollCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // Sai số 1px do scrollLeft lẻ khi zoom trình duyệt.
    setEdges({
      start: track.scrollLeft <= 1,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    track.addEventListener("scroll", updateEdges, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateEdges);
    };
  }, [updateEdges]);

  const slide = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * PAGE_RATIO, behavior: "smooth" });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={ariaLabel} className={cn("relative", className)}>
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {Children.toArray(children).map((child, index) => (
          <li
            key={(child as React.ReactElement).key ?? index}
            aria-roledescription="slide"
            className={cn("shrink-0 snap-start", itemClassName)}
          >
            {child}
          </li>
        ))}
      </ul>
      {!edges.start && <CarouselButton side="start" onClick={() => slide(-1)} />}
      {!edges.end && <CarouselButton side="end" onClick={() => slide(1)} />}
    </div>
  );
}

function CarouselButton({ side, onClick }: { side: "start" | "end"; onClick: () => void }) {
  const Icon = side === "start" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      aria-label={side === "start" ? "Trượt về trước" : "Trượt tiếp"}
      className={cn(
        "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background shadow-md sm:inline-flex",
        side === "start" ? "-left-4" : "-right-4",
      )}
    >
      <Icon aria-hidden />
    </Button>
  );
}
