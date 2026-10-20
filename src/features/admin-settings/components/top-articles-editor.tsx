"use client";

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, RefreshCwIcon, SaveIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { type TAdminArticleCrop, useAdminArticleCrops, useAdminArticleTargets } from "@/features/article-admin";
import {
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms";
import { Callout, FormField } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { useCropTopArticles } from "../hooks/use-crop-top-articles";
import { useSetCropTopArticles } from "../hooks/use-set-crop-top-articles";
import type { TCropTopArticles } from "../types/admin-settings.types";

export type TTopArticlesEditorProps = {
  /** Cây trong URL (`?crop=`); không có → cây đầu tiên. */
  cropSlug?: string;
  className?: string;
};

/**
 * Bài nổi bật của từng cây (Specs/19102026/admin.md "top articles"): chọn cây → danh sách có thứ tự (lên / xuống / bỏ),
 * thêm từ bài đã publish của cây, tối đa `limit` → lưu. Trang chủ hiện các bài này theo thứ tự.
 */
export function TopArticlesEditor({ cropSlug, className }: TTopArticlesEditorProps) {
  const router = useRouter();
  const crops = useAdminArticleCrops();
  const selected = cropSlug ?? crops.data?.crops[0]?.slug;

  if (crops.isError) {
    return (
      <Callout
        tone="danger"
        role="alert"
        title="Không tải được danh sách cây"
        className={className}
        action={
          <Button size="sm" variant="outline" onClick={() => void crops.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
      >
        {crops.error.message}
      </Callout>
    );
  }

  return (
    <section aria-label="Bài nổi bật theo cây" className={cn("card-normal flex flex-col gap-5 rounded-xl p-4 sm:p-6", className)}>
      <FormField id="top-articles-crop" label="Cây trồng">
        {(control) => (
          <Select
            value={selected ?? ""}
            onValueChange={(slug) => router.replace(ROUTES.admin.settings.topArticles(slug))}
            disabled={!crops.data}
          >
            <SelectTrigger className="w-full sm:w-72" {...control}>
              <SelectValue placeholder={crops.isPending ? "Đang tải…" : "Chọn cây"} />
            </SelectTrigger>
            <SelectContent position="popper">
              {crops.data?.crops.map((crop: TAdminArticleCrop) => (
                <SelectItem key={crop.slug} value={crop.slug}>
                  {crop.nameVi} ({crop.publishedCount} bài đã publish)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>

      {/* key: đổi cây → danh sách nháp mới. */}
      {selected && <CropEditor key={selected} cropSlug={selected} />}
    </section>
  );
}

function CropEditor({ cropSlug }: { cropSlug: string }) {
  const top = useCropTopArticles(cropSlug);

  if (top.isPending) {
    return (
      <div aria-busy aria-label="Đang tải bài nổi bật" className="flex flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (top.isError) {
    return (
      <Callout
        tone="danger"
        role="alert"
        action={
          <Button size="sm" variant="outline" onClick={() => void top.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
      >
        {top.error.message}
      </Callout>
    );
  }

  // key: lưu xong / refetch → nháp lấy lại từ server.
  return <TopList key={top.dataUpdatedAt} cropSlug={cropSlug} saved={top.data} />;
}

type TListItem = { slug: string; title: string; isPublished: boolean };

function TopList({ cropSlug, saved }: { cropSlug: string; saved: TCropTopArticles }) {
  const targets = useAdminArticleTargets(cropSlug);
  const setTop = useSetCropTopArticles(cropSlug);
  const initial = useMemo(
    () => saved.articles.map(({ slug, title, isPublished }) => ({ slug, title, isPublished })),
    [saved.articles],
  );
  const [items, setItems] = useState<TListItem[]>(initial);
  const [adding, setAdding] = useState("");
  const [error, setError] = useState<string>();

  const { limit } = saved;
  const dirty = items.map((item) => item.slug).join() !== initial.map((item) => item.slug).join();
  const unpublished = items.filter((item) => !item.isPublished);
  const overLimit = items.length > limit;

  // Bài đã publish của cây, chưa có trong danh sách.
  const candidates = useMemo(() => {
    const chosen = new Set(items.map((item) => item.slug));
    return (targets.data?.targets ?? [])
      .flatMap((target) => (target.article?.isPublished ? [{ ...target.article, nameVi: target.nameVi }] : []))
      .filter((article) => !chosen.has(article.slug));
  }, [targets.data, items]);

  const move = (index: number, delta: -1 | 1) =>
    setItems((current) => {
      const next = [...current];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });

  const add = (slug: string) => {
    const article = candidates.find((candidate) => candidate.slug === slug);
    if (!article) return;
    setItems((current) => [...current, { slug, title: article.title, isPublished: true }]);
    setAdding("");
  };

  const save = () => {
    setError(undefined);
    setTop.mutate(
      { articleSlugs: items.map((item) => item.slug) },
      {
        onSuccess: () => toast.success("Đã lưu bài nổi bật"),
        onError: (cause) => setError(isAppError(cause) ? cause.message : "Lưu thất bại, vui lòng thử lại"),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {items.length}/{limit} bài — bài đầu tiên hiện trước ở trang chủ.
      </p>

      {(unpublished.length > 0 || overLimit) && (
        <Callout tone="warning">
          {unpublished.length > 0 && "Có bài đã bị ẩn (unpublish) — bỏ ra khỏi danh sách trước khi lưu. "}
          {overLimit && `Danh sách vượt giới hạn ${limit} bài — bỏ bớt trước khi lưu.`}
        </Callout>
      )}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-muted-foreground">
          Chưa có bài nổi bật cho cây này.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={item.slug} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-background px-3 py-2">
              <span className="w-6 shrink-0 text-center text-sm font-semibold text-muted-foreground">{index + 1}</span>
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium">{item.title}</span>
                {!item.isPublished && <Badge tone="warning">Đã ẩn</Badge>}
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Đưa "${item.title}" lên`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUpIcon aria-hidden />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Đưa "${item.title}" xuống`}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDownIcon aria-hidden />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Bỏ "${item.title}"`}
                  onClick={() => setItems((current) => current.filter((other) => other.slug !== item.slug))}
                >
                  <XIcon aria-hidden />
                </Button>
              </span>
            </li>
          ))}
        </ol>
      )}

      <FormField
        id={`top-articles-add-${cropSlug}`}
        label="Thêm bài"
        description={items.length >= limit ? `Đã đủ ${limit} bài.` : "Chỉ bài đã publish của cây này."}
      >
        {(control) => (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={adding} onValueChange={setAdding} disabled={items.length >= limit || !targets.data}>
              <SelectTrigger className="w-full sm:flex-1" {...control}>
                <SelectValue
                  placeholder={
                    targets.isPending ? "Đang tải…" : candidates.length === 0 ? "Không còn bài để thêm" : "Chọn bài"
                  }
                />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {candidates.map((article) => (
                  <SelectItem key={article.slug} value={article.slug}>
                    {article.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" disabled={!adding} onClick={() => add(adding)}>
              <PlusIcon aria-hidden />
              Thêm
            </Button>
          </div>
        )}
      </FormField>
      {targets.isError && (
        <Callout
          tone="danger"
          role="alert"
          action={
            <Button size="sm" variant="outline" onClick={() => void targets.refetch()}>
              Thử lại
            </Button>
          }
        >
          Không tải được danh sách bài của cây.
        </Callout>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" disabled={!dirty || setTop.isPending} onClick={() => setItems(initial)}>
          Huỷ thay đổi
        </Button>
        <Button
          variant="highlight"
          loading={setTop.isPending}
          disabled={!dirty || unpublished.length > 0 || overLimit}
          onClick={save}
        >
          {!setTop.isPending && <SaveIcon aria-hidden />}
          Lưu danh sách
        </Button>
      </div>
    </div>
  );
}
