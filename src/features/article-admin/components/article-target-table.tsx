"use client";

import { CornerDownRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArticleOriginBadge } from "@/features/article";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/atoms";
import { Callout, ConfirmDialog } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { isAppError } from "@/shared/lib/http";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/lib/toast";
import { useAdminArticleCrops } from "../hooks/use-admin-article-crops";
import { useAdminArticleTargets } from "../hooks/use-admin-article-targets";
import { useSetArticlePublished } from "../hooks/use-set-article-published";
import type { TAdminArticleTarget } from "../types/article-admin.types";
import { AdminCropSelect } from "./admin-crop-select";
import { ArticleRowActions } from "./article-row-actions";

const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "missing", label: "Chưa có bài" },
  { value: "written", label: "Đã có bài" },
] as const;
type TTargetFilter = (typeof FILTERS)[number]["value"];

const matchesFilter = (target: TAdminArticleTarget, filter: TTargetFilter) =>
  filter === "all" || (filter === "missing" ? !target.article : Boolean(target.article));

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

const errorMessage = (error: unknown, fallback: string) => (isAppError(error) ? error.message : fallback);

export type TArticleTargetTableProps = {
  /** Cây trong URL (`?crop=`); không có → cây đầu tiên. */
  cropSlug?: string;
  className?: string;
};

/**
 * Danh sách bài viết (admin-page.png (4)): chọn cây → bảng bệnh / variant của cây với cột
 * Tên bệnh · Kiểm duyệt · Cập nhật lần cuối · Actions; lọc nhanh bệnh chưa có bài.
 */
export function ArticleTargetTable({ cropSlug, className }: TArticleTargetTableProps) {
  const router = useRouter();
  const crops = useAdminArticleCrops();
  const selectedCrop = cropSlug ?? crops.data?.crops[0]?.slug;
  const targets = useAdminArticleTargets(selectedCrop);
  const [filter, setFilter] = useState<TTargetFilter>("all");

  const [toggling, setToggling] = useState<TAdminArticleTarget | null>(null);
  const setPublished = useSetArticlePublished(selectedCrop ?? "");

  // Bệnh chính đã có bài → variant của nó mới tạo được bài.
  const diseasesWithArticle = useMemo(
    () =>
      new Set(
        targets.data?.targets.filter((target) => !target.variantCode && target.article).map((t) => t.diseaseCode),
      ),
    [targets.data],
  );
  const rows = targets.data?.targets.filter((target) => matchesFilter(target, filter)) ?? [];
  const missingCount = targets.data?.targets.filter((target) => !target.article).length ?? 0;

  const openToggle = (target: TAdminArticleTarget) => {
    setPublished.reset();
    setToggling(target);
  };
  const confirmToggle = () => {
    if (!toggling?.article) return;
    const published = !toggling.article.isPublished;
    setPublished.mutate(
      { code: toggling.code, published },
      {
        onSuccess: () => {
          toast.success(published ? "Đã publish bài viết" : "Đã ẩn bài viết");
          setToggling(null);
        },
      },
    );
  };
  const willPublish = toggling?.article ? !toggling.article.isPublished : false;

  return (
    <section className={cn("flex flex-col gap-4", className)} aria-labelledby="article-target-table-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 id="article-target-table-title" className="text-xl font-semibold">
            Bài viết bệnh cây trồng
          </h1>
          <p className="text-sm text-muted-foreground">
            Mỗi bệnh có 1 bài. {targets.data && `${missingCount} bệnh chưa có bài.`}
          </p>
        </div>
        {crops.isPending ? (
          <div className="h-9 w-full animate-pulse rounded-md bg-muted sm:w-72" aria-label="Đang tải cây trồng" />
        ) : (
          <AdminCropSelect
            crops={crops.data?.crops ?? []}
            value={selectedCrop}
            onValueChange={(slug) => {
              setFilter("all");
              router.replace(ROUTES.admin.articles.list(slug));
            }}
          />
        )}
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as TTargetFilter)}>
        <TabsList>
          {FILTERS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {crops.isError || targets.isError ? (
        <Callout
          tone="danger"
          title="Không tải được danh sách bài viết"
          action={
            <Button type="button" size="sm" variant="outline" onClick={() => (crops.isError ? crops.refetch() : targets.refetch())}>
              Thử lại
            </Button>
          }
        >
          {errorMessage(crops.error ?? targets.error, "Đã có lỗi xảy ra, vui lòng thử lại.")}
        </Callout>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-subtle">
          <Table>
            <TableHeader className="table-header">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-primary-foreground">Tên bệnh</TableHead>
                <TableHead className="text-primary-foreground">Kiểm duyệt</TableHead>
                <TableHead className="text-primary-foreground">Cập nhật lần cuối</TableHead>
                <TableHead className="text-right text-primary-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!targets.data ? (
                <SkeletonRows />
              ) : rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    {filter === "missing" ? "Mọi bệnh của cây này đều đã có bài." : "Không có bệnh nào."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((target) => (
                  <TableRow key={target.code} className="table-row-normal">
                    <TableCell className="min-w-56 whitespace-normal">
                      <div className={cn("flex items-start gap-1.5", target.variantCode && "pl-5")}>
                        {target.variantCode && (
                          <CornerDownRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-label="Variant" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium">{target.nameVi}</div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            <code>{target.code}</code>
                            {target.article && !target.article.isPublished && <Badge tone="warning">Đang ẩn</Badge>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {target.article ? (
                        <ArticleOriginBadge origin={target.article.origin} />
                      ) : (
                        <span className="text-muted-foreground">Chưa có bài</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {target.article ? (
                        <time dateTime={target.article.updatedAt}>
                          {dateTimeFormatter.format(new Date(target.article.updatedAt))}
                        </time>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ArticleRowActions
                        target={target}
                        cropSlug={selectedCrop ?? ""}
                        canCreate={!target.variantCode || diseasesWithArticle.has(target.diseaseCode)}
                        onTogglePublished={openToggle}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={toggling !== null}
        onOpenChange={(open) => !open && setToggling(null)}
        title={willPublish ? "Publish bài viết?" : "Unpublish bài viết?"}
        description={
          willPublish
            ? `Bài "${toggling?.nameVi}" sẽ hiện lại trên trang public.`
            : `Bài "${toggling?.nameVi}" sẽ bị ẩn khỏi trang public (trang trả 404, rời danh sách và sitemap). Bạn vẫn sửa được bài.`
        }
        confirmLabel={willPublish ? "Publish" : "Unpublish"}
        destructive={!willPublish}
        loading={setPublished.isPending}
        error={setPublished.error ? errorMessage(setPublished.error, "Không đổi được trạng thái, vui lòng thử lại.") : undefined}
        onConfirm={confirmToggle}
      />
    </section>
  );
}

function SkeletonRows() {
  return Array.from({ length: 6 }, (_, index) => (
    <TableRow key={index} className="hover:bg-transparent" aria-hidden>
      {Array.from({ length: 4 }, (_, cell) => (
        <TableCell key={cell}>
          <div className="h-4 w-full max-w-40 animate-pulse rounded bg-muted" />
        </TableCell>
      ))}
    </TableRow>
  ));
}
