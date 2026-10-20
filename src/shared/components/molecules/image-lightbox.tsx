"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../atoms";

export type TImageLightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  /** Alt của ảnh — mặc định `title`. */
  alt?: string;
  /** Mô tả cho screen reader (ẩn) — vd. "Ảnh phóng to kèm khung vùng bệnh". */
  description?: string;
  /** Hiện dưới ảnh (vd. chú thích + nguồn ảnh). */
  caption?: React.ReactNode;
  /** Lớp phủ đặt chồng lên ảnh, cùng kích thước ảnh (vd. khung vùng bệnh). */
  overlay?: React.ReactNode;
};

/** Xem ảnh toàn màn hình; mobile phóng to bằng 2 ngón (pinch-zoom), cuộn để xem phần bị cắt. */
export function ImageLightbox({
  open,
  onOpenChange,
  url,
  title,
  alt,
  description = "Ảnh phóng to",
  caption,
  overlay,
}: TImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 left-0 flex h-dvh max-w-full translate-x-0 translate-y-0 flex-col gap-2 rounded-none p-2 sm:max-w-full sm:p-4">
        <div className="pr-10 pl-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </div>
        <div className="flex min-h-0 flex-1 touch-pinch-zoom items-center justify-center overflow-auto">
          <div className="relative inline-block">
            <Image
              src={url}
              alt={alt ?? title}
              width={0}
              height={0}
              sizes="100vw"
              unoptimized
              className="block h-auto max-h-[calc(100dvh-5rem)] w-auto max-w-full"
            />
            {overlay}
          </div>
        </div>
        {caption && <div className="px-2 text-center text-sm text-muted-foreground">{caption}</div>}
      </DialogContent>
    </Dialog>
  );
}
