import Image from "next/image";
import { ArticleMarkdown } from "@/features/article";
import { cn } from "@/shared/lib/utils";
import type { TArticleFormValues } from "../types/article-admin.types";
import { toArticlePreview, type TArticlePreviewCrop } from "../utils/article-preview.util";

export type TArticlePreviewBodyProps = {
  /** Nội dung bài — bài đang lưu (qua toArticleFormValues) hoặc giá trị form chưa lưu. */
  values: Pick<TArticleFormValues, "title" | "summary" | "markdown" | "images" | "cover" | "sources">;
  crop: TArticlePreviewCrop;
  /** Phía trên tiêu đề — nhãn kiểm duyệt / trạng thái. */
  badges?: React.ReactNode;
  /** Dưới tóm tắt — ngày cập nhật, thao tác... */
  meta?: React.ReactNode;
  className?: string;
};

/** Bài như trang public: tiêu đề, tóm tắt, ảnh bìa, nội dung markdown, nguồn tham khảo. Ảnh dùng URL xem trước. */
export function ArticlePreviewBody({ values, crop, badges, meta, className }: TArticlePreviewBodyProps) {
  const cover = values.images.find((image) => image.file === values.cover && image.previewUrl);
  const sources = values.sources.filter((source) => source.title.trim() && source.url.trim());

  return (
    <article className={cn("flex flex-col gap-6", className)}>
      <header className="flex flex-col gap-3">
        {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
        <h1 className="text-2xl font-bold sm:text-3xl">
          {values.title.trim() || <span className="text-muted-foreground">(Chưa có tiêu đề)</span>}
        </h1>
        {values.summary.trim() && <p className="text-muted-foreground">{values.summary}</p>}
        {meta}
      </header>

      {cover?.previewUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image src={cover.previewUrl} alt={cover.alt} fill sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover" />
        </div>
      )}

      {values.markdown.trim() ? (
        <ArticleMarkdown article={toArticlePreview(values, crop)} />
      ) : (
        <p className="text-sm text-muted-foreground">Chưa có nội dung.</p>
      )}

      {sources.length > 0 && (
        <section className="flex flex-col gap-2 border-t border-border-subtle pt-4">
          <h2 className="text-lg font-semibold">Nguồn tham khảo</h2>
          <ol className="list-decimal pl-5 text-sm">
            {sources.map((source, index) => (
              <li key={`${source.url}-${index}`}>
                <a href={source.url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
                  {source.title}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
