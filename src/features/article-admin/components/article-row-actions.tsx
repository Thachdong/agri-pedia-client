import { EyeIcon, EyeOffIcon, PencilIcon, PlusIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import type { TAdminArticleTarget } from "../types/article-admin.types";

export type TArticleRowActionsProps = {
  target: TAdminArticleTarget;
  cropSlug: string;
  /** Variant chỉ viết được khi bệnh chính đã có bài — false → nút "Tạo" bị khoá kèm lý do. */
  canCreate: boolean;
  /** Bấm Unpublish / Publish — bảng mở hộp xác nhận. */
  onTogglePublished: (target: TAdminArticleTarget) => void;
  className?: string;
};

const LABEL_CLASS = "hidden lg:inline";

/** Cột Actions: chưa có bài → Tạo; có bài → Xem / Sửa / Unpublish (bài đang ẩn → Publish). */
export function ArticleRowActions({ target, cropSlug, canCreate, onTogglePublished, className }: TArticleRowActionsProps) {
  const { article } = target;

  if (!article) {
    return (
      <div className={cn("flex justify-end", className)}>
        <Button
          asChild={canCreate}
          size="sm"
          variant="highlight"
          disabled={!canCreate}
          title={canCreate ? undefined : "Cần viết bài của bệnh chính trước"}
          aria-label={`Tạo bài cho ${target.nameVi}`}
        >
          {canCreate ? (
            <Link href={ROUTES.admin.articles.new({ crop: cropSlug, code: target.code })}>
              <PlusIcon aria-hidden />
              <span className={LABEL_CLASS}>Tạo</span>
            </Link>
          ) : (
            <>
              <PlusIcon aria-hidden />
              <span className={LABEL_CLASS}>Tạo</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  const PublishIcon = article.isPublished ? EyeOffIcon : SendIcon;
  const publishLabel = article.isPublished ? "Unpublish" : "Publish";

  return (
    <div className={cn("flex justify-end gap-1", className)}>
      <Button asChild size="sm" variant="ghost" aria-label={`Xem bài ${target.nameVi}`}>
        <Link href={ROUTES.admin.articles.detail(target.code)}>
          <EyeIcon aria-hidden />
          <span className={LABEL_CLASS}>Xem</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" aria-label={`Sửa bài ${target.nameVi}`}>
        <Link href={ROUTES.admin.articles.edit(target.code)}>
          <PencilIcon aria-hidden />
          <span className={LABEL_CLASS}>Sửa</span>
        </Link>
      </Button>
      <Button
        type="button"
        size="sm"
        variant={article.isPublished ? "ghost" : "outline"}
        className={cn(article.isPublished && "text-destructive hover:text-destructive")}
        aria-label={`${publishLabel} bài ${target.nameVi}`}
        onClick={() => onTogglePublished(target)}
      >
        <PublishIcon aria-hidden />
        <span className={LABEL_CLASS}>{publishLabel}</span>
      </Button>
    </div>
  );
}
