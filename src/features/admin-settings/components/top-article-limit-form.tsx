"use client";

import { RefreshCwIcon, SaveIcon } from "lucide-react";
import { useEffect } from "react";
import { Button, Input } from "@/shared/components/atoms";
import { Callout, FormField } from "@/shared/components/molecules";
import { applyServerErrors, useAppForm } from "@/shared/lib/form";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { toNumberOrNull } from "@/shared/utils";
import { TOP_ARTICLE_LIMIT_BOUNDS } from "../constants/admin-settings.constants";
import { useTopArticleSettings } from "../hooks/use-top-article-settings";
import { useUpdateTopArticleLimit } from "../hooks/use-update-top-article-limit";
import { topArticleLimitSchema } from "../schemas/admin-settings.schema";
import type { TTopArticleLimitFormValues } from "../types/admin-settings.types";


export type TTopArticleLimitFormProps = { className?: string };

/** Số bài nổi bật tối đa mỗi cây (GET / PUT /admin/knowledge/settings, 1..50). */
export function TopArticleLimitForm({ className }: TTopArticleLimitFormProps) {
  const settings = useTopArticleSettings();
  const update = useUpdateTopArticleLimit();
  const form = useAppForm<TTopArticleLimitFormValues>({ schema: topArticleLimitSchema, defaultValues: { limit: null } });
  const { errors, isDirty, isSubmitting } = form.formState;
  const savedLimit = settings.data?.limit;

  useEffect(() => {
    if (savedLimit !== undefined && !form.formState.isDirty) form.reset({ limit: savedLimit });
  }, [savedLimit, form]);

  const onSubmit = form.handleSubmit(async ({ limit }) => {
    try {
      const saved = await update.mutateAsync({ limit: limit as number });
      form.reset({ limit: saved.limit });
      toast.success("Đã lưu số bài nổi bật");
    } catch (error) {
      applyServerErrors(form, error);
    }
  });

  if (settings.isError) {
    return (
      <Callout
        tone="danger"
        role="alert"
        title="Không tải được số bài nổi bật"
        className={className}
        action={
          <Button size="sm" variant="outline" onClick={() => void settings.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
      >
        {settings.error.message}
      </Callout>
    );
  }

  const error = errors.limit?.message ?? errors.root?.server?.message;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("card-normal flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-end sm:p-6", className)}
    >
      <FormField
        id="top-article-limit"
        label="Số bài nổi bật mỗi cây"
        description={`Từ ${TOP_ARTICLE_LIMIT_BOUNDS.min} đến ${TOP_ARTICLE_LIMIT_BOUNDS.max}. Danh sách đang dài hơn được giữ nguyên; trang chủ chỉ hiện số bài đầu theo giới hạn này.`}
        required
        error={error}
        className="flex-1"
      >
        {(control) => (
          <Input
            {...control}
            {...form.register("limit", { setValueAs: toNumberOrNull })}
            type="number"
            inputMode="numeric"
            step={1}
            className="sm:w-40"
            disabled={settings.isPending || isSubmitting}
          />
        )}
      </FormField>
      <Button type="submit" variant="highlight" loading={isSubmitting} disabled={!isDirty} className="sm:mb-6">
        {!isSubmitting && <SaveIcon aria-hidden />}
        Lưu
      </Button>
    </form>
  );
}
