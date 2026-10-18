"use client";

import { ChevronRightIcon, CornerDownRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { isAppError } from "@/shared/lib/http";
import { cn } from "@/shared/lib/utils";
import { useAdminArticleCrops } from "../hooks/use-admin-article-crops";
import { useAdminArticleTargets } from "../hooks/use-admin-article-targets";
import { AdminCropSelect } from "./admin-crop-select";

export type TArticleTargetPickerProps = {
  /** Cây trong URL (`?crop=`); không có → cây đầu tiên. */
  cropSlug?: string;
  className?: string;
};

/**
 * Bước 1 của "Create" (vào từ menu, chưa biết bệnh): chọn cây → chọn 1 bệnh / variant chưa có bài.
 * Variant chỉ chọn được khi bệnh chính đã có bài.
 */
export function ArticleTargetPicker({ cropSlug, className }: TArticleTargetPickerProps) {
  const router = useRouter();
  const crops = useAdminArticleCrops();
  const selectedCrop = cropSlug ?? crops.data?.crops[0]?.slug;
  const targets = useAdminArticleTargets(selectedCrop);

  const all = targets.data?.targets ?? [];
  const diseasesWithArticle = new Set(all.filter((t) => !t.variantCode && t.article).map((t) => t.diseaseCode));
  const missing = all.filter((target) => !target.article);
  const error = crops.error ?? targets.error;

  return (
    <section className={cn("flex flex-col gap-4", className)} aria-labelledby="article-target-picker-title">
      <div className="flex flex-col gap-1">
        <h1 id="article-target-picker-title" className="text-xl font-semibold">
          Viết bài mới
        </h1>
        <p className="text-sm text-muted-foreground">Chọn cây trồng rồi chọn bệnh chưa có bài viết.</p>
      </div>

      {crops.isPending ? (
        <div className="h-9 w-full animate-pulse rounded-md bg-muted sm:w-72" aria-label="Đang tải cây trồng" />
      ) : (
        <AdminCropSelect
          crops={crops.data?.crops ?? []}
          value={selectedCrop}
          onValueChange={(slug) => router.replace(ROUTES.admin.articles.new({ crop: slug }))}
        />
      )}

      {error ? (
        <Callout
          tone="danger"
          title="Không tải được danh sách bệnh"
          action={
            <Button type="button" size="sm" variant="outline" onClick={() => (crops.isError ? crops.refetch() : targets.refetch())}>
              Thử lại
            </Button>
          }
        >
          {isAppError(error) ? error.message : "Đã có lỗi xảy ra, vui lòng thử lại."}
        </Callout>
      ) : !targets.data ? (
        <ul className="flex flex-col gap-2" aria-busy aria-label="Đang tải danh sách bệnh">
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </ul>
      ) : missing.length === 0 ? (
        <Callout tone="success">Mọi bệnh của cây này đều đã có bài viết.</Callout>
      ) : (
        <ul className="flex flex-col gap-2">
          {missing.map((target) => {
            const enabled = !target.variantCode || diseasesWithArticle.has(target.diseaseCode);
            const content = (
              <>
                {target.variantCode && <CornerDownRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{target.nameVi}</span>
                  <span className="block text-xs text-muted-foreground">
                    <code>{target.code}</code>
                    {!enabled && " · Cần viết bài của bệnh chính trước"}
                  </span>
                </span>
                {enabled && <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
              </>
            );
            const itemClass = cn("card-normal flex items-center gap-2 rounded-lg px-4 py-3", target.variantCode && "ml-6");
            return (
              <li key={target.code}>
                {enabled && selectedCrop ? (
                  <Link
                    href={ROUTES.admin.articles.new({ crop: selectedCrop, code: target.code })}
                    className={cn(itemClass, "outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring")}
                  >
                    {content}
                  </Link>
                ) : (
                  <div aria-disabled className={cn(itemClass, "opacity-60")}>
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
