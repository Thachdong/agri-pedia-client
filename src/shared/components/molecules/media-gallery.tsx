"use client";

import { FileTextIcon, ImageOffIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

/** 1 media hiển thị — `url` thường là signed URL (host ngoài → next/image `unoptimized`). */
export type TGalleryMedia = { id: string; type: "IMAGE" | "VIDEO" | "FILE"; url: string };

export type TMediaGalleryProps = Omit<React.ComponentProps<"div">, "children"> & {
  media: TGalleryMedia[];
  /** Tên vật thể (vd. tên sản phẩm) — dùng cho alt / nhãn. */
  label: string;
};

function MediaPreview({ item, label }: { item: TGalleryMedia; label: string }) {
  if (item.type === "IMAGE") {
    return <Image src={item.url} alt={label} fill sizes="(min-width: 640px) 32rem, 100vw" unoptimized className="object-contain" />;
  }
  if (item.type === "VIDEO") {
    return <video src={item.url} controls preload="metadata" aria-label={label} className="size-full object-contain" />;
  }
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex size-full flex-col items-center justify-center gap-2 text-sm text-highlight underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
    >
      <FileTextIcon className="size-8" aria-hidden />
      Mở tệp đính kèm
    </a>
  );
}

/**
 * Xem media: khung lớn (ảnh / video có controls / link mở file) + hàng thumbnail để đổi media đang xem.
 * Không có media → khung "Chưa có ảnh". 1 media → không hiện hàng thumbnail.
 */
export function MediaGallery({ media, label, className, ...props }: TMediaGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Media đang chọn bị xoá (refetch) → quay về media đầu.
  const current = media.find((item) => item.id === selectedId) ?? media[0];

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border-subtle bg-muted">
        {current ? (
          <MediaPreview item={current} label={label} />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <ImageOffIcon className="size-8" aria-hidden />
            Chưa có ảnh
          </div>
        )}
      </div>

      {media.length > 1 && (
        <ul className="scrollbar-thin flex gap-2 overflow-x-auto pb-1" aria-label={`Media của ${label}`}>
          {media.map((item, index) => {
            const selected = item.id === current?.id;
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-label={`Xem media ${index + 1}`}
                  aria-current={selected || undefined}
                  className={cn(
                    "relative flex size-14 items-center justify-center overflow-hidden rounded-md border-2 bg-muted text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "border-highlight" : "border-transparent hover:border-highlight/50",
                  )}
                >
                  {item.type === "IMAGE" ? (
                    <Image src={item.url} alt="" fill sizes="56px" unoptimized className="object-cover" />
                  ) : item.type === "VIDEO" ? (
                    <PlayIcon className="size-5" aria-hidden />
                  ) : (
                    <FileTextIcon className="size-5" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
