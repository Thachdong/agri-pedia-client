"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button, Input } from "@/shared/components/atoms";
import { FormField } from "@/shared/components/molecules";
import type { TAppForm } from "@/shared/lib/form";
import { cn } from "@/shared/lib/utils";
import type { TArticleFormValues } from "../types/article-admin.types";

export type TArticleSourcesFieldProps = {
  form: TAppForm<TArticleFormValues>;
  disabled?: boolean;
  className?: string;
};

/** Nguồn tham khảo của bài (tiêu đề + link) — hiện cuối bài trên trang public. Không bắt buộc. */
export function ArticleSourcesField({ form, disabled, className }: TArticleSourcesFieldProps) {
  const { errors, isSubmitted } = form.formState;
  const sources = form.watch("sources");
  const setOptions = { shouldDirty: true, shouldValidate: isSubmitted };

  const addSource = () => form.setValue("sources", [...form.getValues("sources"), { title: "", url: "" }], setOptions);
  const removeSource = (index: number) =>
    form.setValue(
      "sources",
      form.getValues("sources").filter((_, position) => position !== index),
      setOptions,
    );

  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-3", className)} disabled={disabled}>
      <legend className="sr-only">Nguồn tham khảo</legend>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium" aria-hidden>
          Nguồn tham khảo
        </span>
        <Button type="button" size="sm" variant="outline" onClick={addSource}>
          <PlusIcon aria-hidden />
          Thêm nguồn
        </Button>
      </div>

      {sources.length === 0 && <p className="text-sm text-muted-foreground">Chưa có nguồn nào.</p>}

      <ol className="flex flex-col gap-3">
        {sources.map((_, index) => {
          const id = `article-source-${index}`;
          const fieldErrors = errors.sources?.[index];
          return (
            // Nguồn không có id ổn định; xoá luôn đi kèm re-register theo index nên key theo vị trí là đủ.
            <li key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
              <FormField id={`${id}-title`} label={`Tiêu đề ${index + 1}`} required error={fieldErrors?.title?.message}>
                {(control) => <Input {...control} {...form.register(`sources.${index}.title`)} />}
              </FormField>
              <FormField id={`${id}-url`} label="Link" required error={fieldErrors?.url?.message}>
                {(control) => (
                  <Input {...control} type="url" placeholder="https://…" {...form.register(`sources.${index}.url`)} />
                )}
              </FormField>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive sm:mt-6"
                onClick={() => removeSource(index)}
                aria-label={`Bỏ nguồn ${index + 1}`}
              >
                <Trash2Icon aria-hidden />
              </Button>
            </li>
          );
        })}
      </ol>
    </fieldset>
  );
}
