"use client";

import Link from "next/link";
import { Button, Input, Textarea } from "@/shared/components/atoms";
import { Callout, FormField } from "@/shared/components/molecules";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import {
  ARTICLE_ADMIN_ERROR_CODE,
  ARTICLE_ADMIN_ERROR_MESSAGES,
  ARTICLE_SUMMARY_MAX,
  ARTICLE_SUMMARY_MIN,
  ARTICLE_TITLE_MAX,
} from "../constants/article-admin.constants";
import { useCreateArticle } from "../hooks/use-create-article";
import { useUpdateArticle } from "../hooks/use-update-article";
import { createArticleSchema, updateArticleSchema } from "../schemas/article.schema";
import type { TAdminArticleDetail, TArticleFormValues } from "../types/article-admin.types";
import { groupArticleIssues, mapArticleContentIssues } from "../utils/article-errors.util";
import {
  emptyArticleFormValues,
  suggestArticleSlug,
  toArticleFormValues,
  toCreateArticleInput,
  toUpdateArticleInput,
} from "../utils/article-form.util";
import type { TArticlePreviewCrop } from "../utils/article-preview.util";
import { ArticleImagesField } from "./article-images-field";
import { ArticleMarkdownEditor } from "./article-markdown-editor";
import { ArticleSourcesField } from "./article-sources-field";

export type TArticleFormProps = {
  crop: TArticlePreviewCrop;
  /** Đích của nút Huỷ. */
  cancelHref: string;
  /** Lưu thành công — `code` của bài. */
  onSaved: (code: string) => void;
  className?: string;
} & (
  | { mode: "create"; /** Bệnh / variant chưa có bài. */ target: { code: string; nameVi: string } }
  | { mode: "update"; article: TAdminArticleDetail }
);

const FORM_ID = "article-form";

/**
 * Form viết / sửa bài. Tạo mới → bài published, origin ADMIN; sửa → bài AI thành AI_REVIEWED.
 * Lỗi nội dung của server (`details.issues`) được gắn vào field tương ứng.
 */
export function ArticleForm(props: TArticleFormProps) {
  const { crop, cancelHref, onSaved, className } = props;
  const creating = props.mode === "create";
  const createArticle = useCreateArticle(crop.slug);
  const updateArticle = useUpdateArticle(creating ? "" : props.article.code, crop.slug);

  const form = useAppForm<TArticleFormValues>({
    schema: creating ? createArticleSchema : updateArticleSchema,
    defaultValues: creating ? emptyArticleFormValues(suggestArticleSlug(props.target.nameVi)) : toArticleFormValues(props.article),
  });
  const { errors, isSubmitting } = form.formState;
  const [title, summary, images] = form.watch(["title", "summary", "images"]);
  const isUploading = images.some((image) => image.upload?.status === "uploading");

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (props.mode === "create") {
        const { code } = await createArticle.mutateAsync(toCreateArticleInput(props.target.code, values));
        toast.success("Đã tạo bài viết");
        onSaved(code);
      } else {
        const { code } = await updateArticle.mutateAsync(toUpdateArticleInput(values));
        toast.success("Đã lưu bài viết");
        form.reset(values);
        onSaved(code);
      }
    } catch (error) {
      if (!isAppError(error)) {
        form.setError(FORM_ROOT_ERROR, { type: "server", message: "Đã có lỗi xảy ra, vui lòng thử lại." });
        return;
      }
      if (error.code === ARTICLE_ADMIN_ERROR_CODE.invalidContent) {
        const issues = groupArticleIssues(mapArticleContentIssues(error.details));
        if (issues.size > 0) {
          issues.forEach((message, field) => form.setError(field, { type: "server", message }));
          form.setError(FORM_ROOT_ERROR, { type: "server", message: "Nội dung chưa hợp lệ — xem các lỗi bên dưới." });
          return;
        }
      }
      if (error.code === ARTICLE_ADMIN_ERROR_CODE.slugTaken) {
        form.setError("slug", { type: "server", message: "Slug đã được dùng cho bài khác của cây này" });
        return;
      }
      const message = ARTICLE_ADMIN_ERROR_MESSAGES[error.code];
      if (message) form.setError(FORM_ROOT_ERROR, { type: "server", message });
      else applyServerErrors(form, error);
    }
  });

  const rootError = errors.root?.server?.message;

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-6", className)}>
      {rootError && (
        <Callout tone="danger" role="alert">
          {rootError}
        </Callout>
      )}

      <section className="flex flex-col gap-4" aria-label="Thông tin bài">
        <FormField
          id="article-title"
          label="Tiêu đề"
          required
          error={errors.title?.message}
          description={`${title.trim().length}/${ARTICLE_TITLE_MAX} ký tự`}
        >
          {(control) => <Input {...control} {...form.register("title")} disabled={isSubmitting} />}
        </FormField>

        <FormField
          id="article-slug"
          label="Slug (đường dẫn)"
          required={creating}
          error={errors.slug?.message}
          description={
            creating
              ? `Không đổi được sau khi tạo. Đường dẫn: /benh-cay-trong/${crop.slug}/${form.watch("slug") || "…"}`
              : "Slug cố định sau khi tạo."
          }
        >
          {(control) => (
            <Input
              {...control}
              {...form.register("slug")}
              readOnly={!creating}
              disabled={isSubmitting}
              className={cn("font-mono", !creating && "bg-muted")}
            />
          )}
        </FormField>

        <FormField
          id="article-summary"
          label="Tóm tắt"
          required
          error={errors.summary?.message}
          description={`${summary.trim().length}/${ARTICLE_SUMMARY_MAX} ký tự (tối thiểu ${ARTICLE_SUMMARY_MIN}) — dùng cho thẻ bài và mô tả SEO.`}
        >
          {(control) => <Textarea {...control} rows={3} {...form.register("summary")} disabled={isSubmitting} />}
        </FormField>
      </section>

      <ArticleImagesField form={form} disabled={isSubmitting} />

      <ArticleMarkdownEditor form={form} crop={crop} disabled={isSubmitting} />

      <ArticleSourcesField form={form} disabled={isSubmitting} />

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-border-subtle bg-background px-4 py-3 sm:-mx-6 sm:px-6">
        {isUploading && <p className="mr-auto text-xs text-muted-foreground">Đang tải ảnh lên…</p>}
        <Button asChild variant="outline">
          <Link href={cancelHref}>Huỷ</Link>
        </Button>
        <Button type="submit" variant="highlight" loading={isSubmitting} disabled={isUploading}>
          {creating ? "Tạo bài viết" : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
}
