"use client";

import { ImagePlusIcon, Loader2Icon, TextCursorInputIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { getMediaAccept, useMediaUploads } from "@/features/media";
import { Button, Input, Label, RadioGroup, RadioGroupItem } from "@/shared/components/atoms";
import { FormField } from "@/shared/components/molecules";
import type { TAppForm } from "@/shared/lib/form";
import { cn } from "@/shared/lib/utils";
import type { TArticleFormValues, TArticleImageFormValue } from "../types/article-admin.types";
import { suggestImageFile } from "../utils/article-form.util";

const IMAGE_TYPES = ["IMAGE"] as const;
const IMAGE_ACCEPT = getMediaAccept(IMAGE_TYPES);

/** Key ổn định của 1 ảnh — tên file sửa được nên không dùng làm key. */
const imageKey = (image: TArticleImageFormValue, index: number) => image.upload?.id ?? image.previewUrl ?? `image-${index}`;

export type TArticleImagesFieldProps = {
  form: TAppForm<TArticleFormValues>;
  disabled?: boolean;
  className?: string;
};

/**
 * Ảnh của bài: thêm ảnh (upload lên TMP ngay khi chọn), tên file dùng trong markdown, alt, chú thích, nguồn ảnh
 * (credit), chọn ảnh bìa, chèn ảnh vào nội dung. Ảnh đã lưu giữ nguyên theo tên file; bỏ khỏi danh sách = xoá khi lưu.
 */
export function ArticleImagesField({ form, disabled, className }: TArticleImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { errors, isSubmitted } = form.formState;
  const [images, cover] = form.watch(["images", "cover"]);
  const setOptions = { shouldDirty: true, shouldValidate: isSubmitted };

  // Object URL của ảnh mới — thu hồi khi bỏ ảnh / rời form.
  const objectUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const updateUpload = (id: string, update: (image: TArticleImageFormValue) => TArticleImageFormValue | null) => {
    const current = form.getValues("images");
    if (!current.some((image) => image.upload?.id === id)) return;
    const next = current.flatMap((image) => {
      if (image.upload?.id !== id) return [image];
      const updated = update(image);
      return updated ? [updated] : [];
    });
    form.setValue("images", next, { shouldValidate: form.formState.isSubmitted });
  };

  const uploads = useMediaUploads({
    types: IMAGE_TYPES,
    onUpdate: (upload) => updateUpload(upload.id, (image) => ({ ...image, upload })),
    onFail: (id) => removeImage(form.getValues("images").findIndex((image) => image.upload?.id === id)),
  });

  const selectImages = (files: File[]) => {
    const started = uploads.start(files);
    if (started.length === 0) return;
    const current = form.getValues("images");
    const taken = new Set(current.map((image) => image.file));
    const added = started.map((upload): TArticleImageFormValue => {
      const file = suggestImageFile(upload.file.name, taken);
      taken.add(file);
      const previewUrl = URL.createObjectURL(upload.file);
      objectUrls.current.add(previewUrl);
      return {
        file,
        alt: "",
        caption: "",
        credit: { source: "", author: "", license: "", url: "" },
        previewUrl,
        upload,
      };
    });
    form.setValue("images", [...current, ...added], setOptions);
    if (!form.getValues("cover")) form.setValue("cover", added[0].file, setOptions);
  };

  const removeImage = (index: number) => {
    const current = form.getValues("images");
    const removed = current[index];
    if (!removed) return;
    if (removed.upload) uploads.cancel(removed.upload.id);
    if (removed.previewUrl && objectUrls.current.delete(removed.previewUrl)) URL.revokeObjectURL(removed.previewUrl);
    const next = current.filter((_, position) => position !== index);
    form.setValue("images", next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
    if (form.getValues("cover") === removed.file) {
      form.setValue("cover", next[0]?.file ?? "", { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
    }
  };

  /** Đổi tên file → ảnh bìa đang trỏ tên cũ đi theo. */
  const renameImage = (index: number, file: string) => {
    const previous = form.getValues(`images.${index}.file`);
    form.setValue(`images.${index}.file`, file, setOptions);
    if (form.getValues("cover") === previous) form.setValue("cover", file, setOptions);
  };

  /** Chèn `![alt](file)` vào cuối nội dung. */
  const insertImage = (image: TArticleImageFormValue) => {
    const markdown = form.getValues("markdown").trimEnd();
    const snippet = `![${image.alt || image.file}](${image.file})`;
    form.setValue("markdown", markdown ? `${markdown}\n\n${snippet}\n` : `${snippet}\n`, setOptions);
  };

  const listError = errors.images?.message ?? errors.images?.root?.message;

  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-3", className)} disabled={disabled}>
      <legend className="sr-only">Ảnh của bài</legend>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium" aria-hidden>
          Ảnh <span className="text-destructive">*</span>
        </span>
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <ImagePlusIcon aria-hidden />
          Thêm ảnh
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          hidden
          onChange={(event) => {
            selectImages(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        JPG, PNG hoặc WebP, tối đa 10MB — server lưu thành WebP rộng tối đa 1600px. Dùng trong nội dung bằng{" "}
        <code>![mô tả](tên-file.webp)</code>.
      </p>

      {images.length === 0 && (
        <p className="rounded-lg border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-muted-foreground">
          Chưa có ảnh. Bài cần ít nhất 1 ảnh làm ảnh bìa.
        </p>
      )}

      <RadioGroup
        value={cover}
        onValueChange={(file) => form.setValue("cover", file, setOptions)}
        aria-label="Ảnh bìa"
        className="flex flex-col gap-3"
      >
        {images.map((image, index) => {
          const fieldErrors = errors.images?.[index];
          const id = `article-image-${index}`;
          const uploading = image.upload?.status === "uploading";
          return (
            <div key={imageKey(image, index)} className="card-normal flex flex-col gap-3 rounded-lg p-3 sm:flex-row">
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-40">
                {image.previewUrl && (
                  <Image src={image.previewUrl} alt={image.alt} fill sizes="160px" className="object-cover" />
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/70 text-xs font-medium">
                    <Loader2Icon className="size-4 animate-spin" aria-hidden />
                    {image.upload?.progress ?? 0}%
                  </div>
                )}
              </div>

              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                <FormField id={`${id}-file`} label="Tên file" required error={fieldErrors?.file?.message}>
                  {(control) => (
                    <Input
                      {...control}
                      value={image.file}
                      onChange={(event) => renameImage(index, event.target.value)}
                      // Ảnh đã lưu được giữ theo tên file → không đổi tên được.
                      readOnly={!image.upload}
                      className={cn(!image.upload && "bg-muted")}
                    />
                  )}
                </FormField>
                <FormField id={`${id}-alt`} label="Mô tả ảnh (alt)" required error={fieldErrors?.alt?.message}>
                  {(control) => <Input {...control} {...form.register(`images.${index}.alt`)} />}
                </FormField>
                <FormField id={`${id}-caption`} label="Chú thích" error={fieldErrors?.caption?.message} className="sm:col-span-2">
                  {(control) => <Input {...control} {...form.register(`images.${index}.caption`)} />}
                </FormField>
                <FormField id={`${id}-source`} label="Nguồn ảnh" required error={fieldErrors?.credit?.source?.message}>
                  {(control) => <Input {...control} placeholder="vd. IRRI" {...form.register(`images.${index}.credit.source`)} />}
                </FormField>
                <FormField id={`${id}-author`} label="Tác giả" required error={fieldErrors?.credit?.author?.message}>
                  {(control) => <Input {...control} {...form.register(`images.${index}.credit.author`)} />}
                </FormField>
                <FormField id={`${id}-license`} label="Giấy phép" required error={fieldErrors?.credit?.license?.message}>
                  {(control) => (
                    <Input {...control} placeholder="vd. CC BY 4.0" {...form.register(`images.${index}.credit.license`)} />
                  )}
                </FormField>
                <FormField id={`${id}-url`} label="Link nguồn" required error={fieldErrors?.credit?.url?.message}>
                  {(control) => (
                    <Input {...control} type="url" placeholder="https://…" {...form.register(`images.${index}.credit.url`)} />
                  )}
                </FormField>

                <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id={`${id}-cover`} value={image.file} />
                    <Label htmlFor={`${id}-cover`} className="font-normal">
                      Ảnh bìa
                    </Label>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertImage(image)}>
                      <TextCursorInputIcon aria-hidden />
                      Chèn vào nội dung
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeImage(index)}
                      aria-label={`Bỏ ảnh ${image.file}`}
                    >
                      <Trash2Icon aria-hidden />
                      Bỏ
                    </Button>
                  </div>
                </div>
                {(fieldErrors?.upload?.message ?? fieldErrors?.message) && (
                  <p className="text-xs text-destructive sm:col-span-2" role="alert">
                    {fieldErrors?.upload?.message ?? fieldErrors?.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </RadioGroup>

      {listError && (
        <p className="text-xs text-destructive" role="alert">
          {listError}
        </p>
      )}
      {errors.cover?.message && (
        <p className="text-xs text-destructive" role="alert">
          {errors.cover.message}
        </p>
      )}
    </fieldset>
  );
}
