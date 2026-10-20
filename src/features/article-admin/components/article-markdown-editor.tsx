"use client";

import { useDeferredValue, useState } from "react";
import { ArticleMarkdown } from "@/features/article";
import { Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@/shared/components/atoms";
import type { TAppForm } from "@/shared/lib/form";
import { cn } from "@/shared/lib/utils";
import { ARTICLE_MARKDOWN_MAX } from "../constants/article-admin.constants";
import type { TArticleFormValues } from "../types/article-admin.types";
import { toArticlePreview, type TArticlePreviewCrop } from "../utils/article-preview.util";

export type TArticleMarkdownEditorProps = {
  form: TAppForm<TArticleFormValues>;
  /** Cây của bài — khối `::cta-diagnosis` trong xem trước cần biết cây có bật chẩn đoán không. */
  crop: TArticlePreviewCrop;
  disabled?: boolean;
  className?: string;
};

const ID = "article-markdown";

/**
 * Nội dung bài (markdown): tab Soạn (textarea) / Xem trước (render như trang public, ảnh dùng URL xem trước).
 * Hỗ trợ GFM, `:::warning`, `:::tip`, `::disease-card{code="..."}`, `::cta-diagnosis`; không cho HTML.
 */
export function ArticleMarkdownEditor({ form, crop, disabled, className }: TArticleMarkdownEditorProps) {
  const [tab, setTab] = useState("write");
  const [markdown, images] = form.watch(["markdown", "images"]);
  // Xem trước chỉ render khi mở tab; giá trị trễ để gõ không bị giật.
  const deferredMarkdown = useDeferredValue(markdown);
  const error = form.formState.errors.markdown?.message;
  const describedBy = [`${ID}-description`, error && `${ID}-error`].filter(Boolean).join(" ");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={ID} className="text-sm font-medium">
            Nội dung <span className="text-destructive" aria-hidden>*</span>
          </label>
          <TabsList>
            <TabsTrigger value="write">Soạn</TabsTrigger>
            <TabsTrigger value="preview">Xem trước</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="write" forceMount className="data-[state=inactive]:hidden">
          <Textarea
            id={ID}
            rows={24}
            spellCheck={false}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="min-h-96 font-mono text-sm"
            {...form.register("markdown")}
          />
        </TabsContent>
        <TabsContent value="preview">
          <div className="min-h-96 rounded-md border border-border-subtle p-4 sm:p-6">
            {deferredMarkdown.trim() ? (
              <ArticleMarkdown article={toArticlePreview({ markdown: deferredMarkdown, images }, crop)} />
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có nội dung.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <p id={`${ID}-description`} className="text-xs text-muted-foreground">
        {markdown.length.toLocaleString("vi-VN")}/{ARTICLE_MARKDOWN_MAX.toLocaleString("vi-VN")} ký tự · Markdown (GFM),{" "}
        <code>:::warning</code>, <code>:::tip</code>, <code>::disease-card{"{code=\"...\"}"}</code>, <code>::cta-diagnosis</code>{" "}
        · không dùng HTML.
      </p>
      {error && (
        <p id={`${ID}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
