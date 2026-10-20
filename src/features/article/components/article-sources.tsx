import { ExternalLinkIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TArticleImage, TArticleSource } from "../types/article.types";

export type TArticleSourcesProps = {
  sources: TArticleSource[];
  images: TArticleImage[];
  className?: string;
};

const linkClass =
  "inline-flex items-center gap-1 rounded-sm text-link underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring";

/** Cuối bài: "Nguồn tham khảo" + "Nguồn ảnh" (giấy phép ảnh bắt buộc ghi công). Link ngoài → nofollow, tab mới. */
export function ArticleSources({ sources, images, className }: TArticleSourcesProps) {
  if (sources.length === 0 && images.length === 0) return null;

  return (
    <section aria-labelledby="article-sources" className={cn("flex flex-col gap-4 text-sm", className)}>
      <h2 id="article-sources" className="text-lg font-semibold">
        Nguồn tham khảo
      </h2>
      {sources.length > 0 && (
        <ol className="flex list-decimal flex-col gap-1.5 pl-5">
          {sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer nofollow" className={linkClass}>
                {source.title}
                <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden />
              </a>
            </li>
          ))}
        </ol>
      )}
      {images.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium">Nguồn ảnh</h3>
          <ul className="flex flex-col gap-1 text-muted-foreground">
            {images.map((image) => (
              <li key={image.url}>
                {image.caption ?? image.alt} — Ảnh: {image.credit.author},{" "}
                <a href={image.credit.url} target="_blank" rel="noopener noreferrer nofollow" className={linkClass}>
                  {image.credit.source}
                </a>
                , {image.credit.license}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
