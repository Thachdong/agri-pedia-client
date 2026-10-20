"use client";

import { Maximize2Icon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import type { TArticleImage } from "../types/article.types";

export type TArticleFigureProps = {
  image: TArticleImage;
  className?: string;
};

function ImageCredit({ credit }: Pick<TArticleImage, "credit">) {
  return (
    <>
      Ảnh: {credit.author},{" "}
      <a
        href={credit.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2 hover:text-foreground"
      >
        {credit.source}
      </a>
      , {credit.license}
    </>
  );
}

/**
 * Ảnh trong bài (thay `img` của markdown): next/image theo kích thước thật, chú thích + nguồn ảnh,
 * bấm để xem toàn màn hình. Client component nhỏ nhất có thể — phần còn lại của bài render ở server.
 */
export function ArticleFigure({ image, className }: TArticleFigureProps) {
  const [open, setOpen] = useState(false);
  const caption = (
    <>
      {image.caption && <span className="text-foreground">{image.caption} </span>}
      <span>
        (<ImageCredit credit={image.credit} />)
      </span>
    </>
  );

  return (
    // `not-prose`: tự style ảnh/caption, không lấy margin của typography.
    <figure className={cn("not-prose my-6", className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Phóng to ảnh: ${image.alt}`}
        className="group relative block w-full overflow-hidden rounded-lg border border-border-subtle bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 768px) 100vw, 768px"
          className="mx-auto h-auto max-h-[32rem] w-auto max-w-full"
        />
        <span className="absolute top-2 right-2 rounded-md bg-background/80 p-1.5 text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2Icon className="size-4" aria-hidden />
        </span>
      </button>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>
      <ImageLightbox
        open={open}
        onOpenChange={setOpen}
        url={image.url}
        title={image.caption ?? image.alt}
        alt={image.alt}
        caption={caption}
      />
    </figure>
  );
}
