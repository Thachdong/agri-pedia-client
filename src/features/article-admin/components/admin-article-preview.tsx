"use client";

import { EyeOffIcon, LinkIcon, PencilIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ArticleOriginBadge } from "@/features/article";
import { Badge, Button } from "@/shared/components/atoms";
import { Callout, ConfirmDialog } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { useAdminArticle } from "../hooks/use-admin-article";
import { useAdminArticleCrops } from "../hooks/use-admin-article-crops";
import { useSetArticlePublished } from "../hooks/use-set-article-published";
import { toArticleFormValues } from "../utils/article-form.util";
import { toPreviewCrop } from "../utils/article-preview.util";
import { ArticlePreviewBody } from "./article-preview-body";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

export type TAdminArticlePreviewProps = {
  code: string;
  className?: string;
};

/** Xem bài như trang public (kể cả bài đang ẩn), kèm trạng thái kiểm duyệt / hiển thị và các thao tác. */
export function AdminArticlePreview({ code, className }: TAdminArticlePreviewProps) {
  const article = useAdminArticle(code);
  const crops = useAdminArticleCrops();
  const [confirming, setConfirming] = useState(false);
  const setPublished = useSetArticlePublished(article.data?.crop.slug ?? "");

  if (article.isPending) return <PreviewSkeleton className={className} />;
  if (article.isError) {
    return (
      <Callout
        tone="danger"
        title="Không tải được bài viết"
        className={className}
        action={
          <Button type="button" size="sm" variant="outline" onClick={() => article.refetch()}>
            Thử lại
          </Button>
        }
      >
        {isAppError(article.error) ? article.error.message : "Đã có lỗi xảy ra, vui lòng thử lại."}
      </Callout>
    );
  }

  const data = article.data;
  const willPublish = !data.isPublished;

  const confirmToggle = () =>
    setPublished.mutate(
      { code: data.code, published: willPublish },
      {
        onSuccess: () => {
          toast.success(willPublish ? "Đã publish bài viết" : "Đã ẩn bài viết");
          setConfirming(false);
        },
      },
    );

  return (
    <div className={className}>
      <ArticlePreviewBody
        values={toArticleFormValues(data)}
        crop={toPreviewCrop(crops.data?.crops, data.crop)}
        badges={
          <>
            <ArticleOriginBadge origin={data.origin} />
            {data.isPublished ? <Badge tone="success">Đang hiển thị</Badge> : <Badge tone="warning">Đang ẩn</Badge>}
            <code className="text-xs text-muted-foreground">{data.code}</code>
          </>
        }
        meta={
          <>
            <p className="text-sm text-muted-foreground">
              Cập nhật <time dateTime={data.updatedAt}>{dateTimeFormatter.format(new Date(data.updatedAt))}</time>
              {data.editedBy && ` · Sửa bởi ${data.editedBy}`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="highlight" size="sm">
                <Link href={ROUTES.admin.articles.edit(data.code)}>
                  <PencilIcon aria-hidden />
                  Sửa
                </Link>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setPublished.reset();
                  setConfirming(true);
                }}
              >
                {willPublish ? <SendIcon aria-hidden /> : <EyeOffIcon aria-hidden />}
                {willPublish ? "Publish" : "Unpublish"}
              </Button>
            </div>
            {/* ADMIN không mở được trang public (proxy chuyển về khu quản trị) → chỉ hiện đường dẫn. */}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LinkIcon className="size-3.5" aria-hidden />
              Đường dẫn public: <code className="break-all">{data.path}</code>
              {!data.isPublished && " (đang trả 404)"}
            </p>
          </>
        }
      />

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={willPublish ? "Publish bài viết?" : "Unpublish bài viết?"}
        description={
          willPublish
            ? "Bài sẽ hiện lại trên trang public."
            : "Bài sẽ bị ẩn khỏi trang public (trang trả 404, rời danh sách và sitemap). Bạn vẫn sửa được bài."
        }
        confirmLabel={willPublish ? "Publish" : "Unpublish"}
        destructive={!willPublish}
        loading={setPublished.isPending}
        error={
          setPublished.error
            ? isAppError(setPublished.error)
              ? setPublished.error.message
              : "Không đổi được trạng thái, vui lòng thử lại."
            : undefined
        }
        onConfirm={confirmToggle}
      />
    </div>
  );
}

function PreviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)} aria-busy aria-label="Đang tải bài viết">
      <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
