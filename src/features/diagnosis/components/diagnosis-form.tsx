"use client";

import { SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Textarea } from "@/shared/components/atoms";
import { Callout, FormField } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { APP_ERROR_CODE, isAppError, type AppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import {
  DEFAULT_PLANT_PART,
  DIAGNOSIS_ERROR_CODE,
  DIAGNOSIS_MAX_IMAGES,
  DIAGNOSIS_NOTE_MAX,
} from "../constants/diagnosis.constants";
import { useCreateDiagnosis } from "../hooks/use-create-diagnosis";
import { diagnosisFormSchema } from "../schemas/diagnosis.schema";
import type { TDiagnosisFormImage, TDiagnosisFormValues, TPlantPart } from "../types/diagnosis.types";
import { analyzeImage } from "../utils/blur-score.util";
import { compressImage, ImageDecodeError } from "../utils/compress-image.util";
import { AddImageTile } from "./add-image-tile";
import { CameraCaptureDialog } from "./camera-capture-dialog";
import { DiagnosisImageSlot } from "./diagnosis-image-slot";

const FORM_ID = "diagnosis-form";
const DEFAULT_VALUES: TDiagnosisFormValues = { images: [], note: "" };

const DECODE_ERROR = new ImageDecodeError().message;
const SERVER_IMAGE_ERROR = "Ảnh không hợp lệ hoặc không đọc được, hãy chọn ảnh khác";

const ROOT_MESSAGES: Record<string, string> = {
  [DIAGNOSIS_ERROR_CODE.userNotAllowed]: "Tài khoản chưa kích hoạt, không thể chẩn đoán",
  [DIAGNOSIS_ERROR_CODE.dailyLimitExceeded]: "Bạn đã dùng hết lượt chẩn đoán hôm nay, vui lòng thử lại ngày mai",
};

/** Trạng thái phụ của từng ô ảnh (theo id ô) — không thuộc giá trị form. */
type TImageCheck = { blurry?: boolean; error?: string };

/** `details.images` của DIAGNOSIS_INVALID_IMAGE: `index` null = lỗi chung (số file, số plantPart...). */
const invalidImageIndexes = (error: AppError) => {
  const images = (error.details as { images?: { index: number | null }[] } | undefined)?.images;
  return Array.isArray(images) ? images.map((image) => image.index) : [];
};

// Không dùng crypto.randomUUID — không có khi mở qua http trên LAN (thử trên điện thoại).
const newImage = (file: File): TDiagnosisFormImage => ({
  id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  file,
  plantPart: "",
});

export type TDiagnosisFormProps = {
  /** `code` của cây trồng (GET /knowledge/crops), vd. RICE. */
  cropType: string;
  className?: string;
};

/**
 * Form chẩn đoán (mobile trước): mẹo chụp → lưới ô ảnh (chụp / chọn 1–5 ảnh, mỗi ảnh có thể chọn bộ phận) → ghi chú
 * → thanh "Gửi" dính cuối màn hình. Ảnh được kiểm tra mờ khi thêm, nén JPEG khi gửi.
 * Thành công → thay trang bằng trang kết quả (back không quay lại form).
 */
export function DiagnosisForm({ cropType, className }: TDiagnosisFormProps) {
  const router = useRouter();
  const createDiagnosis = useCreateDiagnosis();
  const form = useAppForm<TDiagnosisFormValues>({ schema: diagnosisFormSchema, defaultValues: DEFAULT_VALUES });
  const [checks, setChecks] = useState<Record<string, TImageCheck>>({});
  const [cameraOpen, setCameraOpen] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const { errors, isSubmitted, isSubmitting } = form.formState;
  const images = form.watch("images");
  const noteLength = form.watch("note").length;
  const busy = isSubmitting || compressing;
  const remaining = Math.max(DIAGNOSIS_MAX_IMAGES - images.length, 0);
  const brokenCount = images.filter((image) => checks[image.id]?.error).length;
  const canSubmit = images.length > 0 && brokenCount === 0 && !busy && !limitReached;

  const setCheck = (id: string, check: TImageCheck) =>
    setChecks((current) => ({ ...current, [id]: { ...current[id], ...check } }));

  const setImages = (next: TDiagnosisFormImage[]) =>
    form.setValue("images", next, { shouldDirty: true, shouldValidate: isSubmitted });

  const addFiles = (files: File[]) => {
    const added = files.slice(0, DIAGNOSIS_MAX_IMAGES - form.getValues("images").length).map(newImage);
    if (added.length === 0) return;
    setImages([...form.getValues("images"), ...added]);
    added.forEach(({ id, file }) => {
      void analyzeImage(file).then(({ decodable, blurry }) =>
        setCheck(id, decodable ? { blurry } : { blurry: false, error: DECODE_ERROR }),
      );
    });
  };

  const removeImage = (id: string) => {
    setImages(form.getValues("images").filter((image) => image.id !== id));
    setChecks((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)));
  };

  const setPlantPart = (id: string, plantPart: TPlantPart) =>
    setImages(form.getValues("images").map((image) => (image.id === id ? { ...image, plantPart } : image)));

  const handleError = (error: unknown, values: TDiagnosisFormValues) => {
    if (!isAppError(error)) return form.setError(FORM_ROOT_ERROR, { type: "server", message: "Đã có lỗi xảy ra, vui lòng thử lại" });

    switch (error.code) {
      case DIAGNOSIS_ERROR_CODE.invalidImage: {
        const indexes = invalidImageIndexes(error);
        indexes.forEach((index) => {
          const image = index === null ? undefined : values.images[index];
          if (image) setCheck(image.id, { error: SERVER_IMAGE_ERROR });
        });
        if (indexes.length === 0 || indexes.includes(null)) {
          form.setError(FORM_ROOT_ERROR, { type: "server", message: error.message });
        }
        return;
      }
      case DIAGNOSIS_ERROR_CODE.cropNotSupported:
        toast.error("Cây trồng chưa được hỗ trợ");
        return router.replace(ROUTES.home);
      case DIAGNOSIS_ERROR_CODE.dailyLimitExceeded:
        setLimitReached(true);
        return form.setError(FORM_ROOT_ERROR, { type: "server", message: ROOT_MESSAGES[error.code] });
      case DIAGNOSIS_ERROR_CODE.userNotAllowed:
        return form.setError(FORM_ROOT_ERROR, { type: "server", message: ROOT_MESSAGES[error.code] });
      case APP_ERROR_CODE.NETWORK_ERROR:
        // Ảnh vẫn giữ nguyên để gửi lại.
        toast.error("Mất kết nối, vui lòng kiểm tra mạng và gửi lại");
        return;
      default:
        applyServerErrors(form, error);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setCompressing(true);
    const results = await Promise.allSettled(values.images.map(({ file }) => compressImage(file)));
    setCompressing(false);

    const failed = results.flatMap((result, index) => (result.status === "rejected" ? [values.images[index]] : []));
    if (failed.length > 0) {
      failed.forEach(({ id }) => setCheck(id, { error: DECODE_ERROR }));
      return;
    }

    try {
      const { id } = await createDiagnosis.mutateAsync({
        cropType,
        images: values.images.map(({ plantPart }, index) => ({
          blob: (results[index] as PromiseFulfilledResult<Blob>).value,
          plantPart: plantPart || DEFAULT_PLANT_PART,
        })),
        note: values.note.trim() || undefined,
      });
      router.replace(ROUTES.diagnosis.detail(id));
    } catch (error) {
      handleError(error, values);
    }
  });

  const rootError = errors.root?.server?.message;
  const imagesError = errors.images?.message ?? errors.images?.root?.message;
  const status = busy
    ? compressing
      ? "Đang nén ảnh…"
      : "Đang gửi…"
    : images.length === 0
      ? "Chưa có ảnh"
      : brokenCount > 0
        ? `${brokenCount} ảnh lỗi — hãy xoá hoặc thay`
        : `${images.length}/${DIAGNOSIS_MAX_IMAGES} ảnh — sẵn sàng`;

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-6", className)} aria-busy={busy}>
      <Callout tone="info" title="Mẹo chụp để có kết quả tốt">
        <ul className="list-disc space-y-0.5 pl-4">
          <li>Chụp gần, rõ vết bệnh, đủ sáng; mỗi ảnh một bộ phận.</li>
          <li>Đưa vết bệnh vào giữa khung hình; có thể chụp nhiều góc (tối đa {DIAGNOSIS_MAX_IMAGES} ảnh).</li>
        </ul>
      </Callout>

      <fieldset className="flex flex-col gap-3" aria-describedby={imagesError ? `${FORM_ID}-images-error` : undefined}>
        <legend className="mb-3 flex w-full items-baseline justify-between gap-2">
          <span className="text-sm font-medium">
            Ảnh cây trồng <span className="text-destructive" aria-hidden>*</span>
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {images.length}/{DIAGNOSIS_MAX_IMAGES} ảnh
          </span>
        </legend>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <DiagnosisImageSlot
              key={image.id}
              index={index}
              file={image.file}
              plantPart={image.plantPart}
              onPlantPartChange={(next) => setPlantPart(image.id, next)}
              onRemove={() => removeImage(image.id)}
              blurry={checks[image.id]?.blurry}
              error={checks[image.id]?.error}
              plantPartError={errors.images?.[index]?.plantPart?.message}
              disabled={busy}
            />
          ))}
          {remaining > 0 && (
            <li>
              <AddImageTile
                remaining={remaining}
                onCapture={() => setCameraOpen(true)}
                onPick={addFiles}
                disabled={busy}
                invalid={Boolean(imagesError)}
              />
            </li>
          )}
        </ul>
        {imagesError && (
          <p id={`${FORM_ID}-images-error`} role="alert" className="text-xs text-destructive">
            {imagesError}
          </p>
        )}
      </fieldset>

      <FormField
        id={`${FORM_ID}-note`}
        label="Ghi chú (tuỳ chọn)"
        error={errors.note?.message}
        description={`${noteLength}/${DIAGNOSIS_NOTE_MAX} ký tự`}
      >
        {(control) => (
          <Textarea
            {...control}
            {...form.register("note")}
            rows={3}
            maxLength={DIAGNOSIS_NOTE_MAX}
            placeholder="Vd. giai đoạn lúa, thời tiết gần đây, vết bệnh xuất hiện từ khi nào…"
            disabled={busy}
            className="resize-none"
          />
        )}
      </FormField>

      {rootError && (
        <Callout tone="danger" role="alert">
          {rootError}
        </Callout>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t border-border-subtle bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <p className="min-w-0 text-xs text-muted-foreground" aria-live="polite">
          {status}
        </p>
        <Button type="submit" variant="highlight" loading={busy} disabled={!canSubmit} className="shrink-0">
          {!busy && <SendIcon aria-hidden />}
          Gửi chẩn đoán
        </Button>
      </div>

      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        remaining={remaining}
        onCapture={(file) => addFiles([file])}
      />
    </form>
  );
}
