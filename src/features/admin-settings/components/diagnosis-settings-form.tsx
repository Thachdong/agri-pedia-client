"use client";

import { RefreshCwIcon, SaveIcon } from "lucide-react";
import { useEffect } from "react";
import { useCrops } from "@/features/diagnosis";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms";
import { Callout, FormField } from "@/shared/components/molecules";
import { applyServerErrors, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { toNumberOrNull } from "@/shared/utils";
import {
  DIAGNOSIS_SETTINGS_BOUNDS,
  MAX_IMAGE_MB_BOUNDS,
  NO_DEFAULT_CROP,
} from "../constants/admin-settings.constants";
import { useAdminDiagnosisSettings } from "../hooks/use-admin-diagnosis-settings";
import { useUpdateDiagnosisSettings } from "../hooks/use-update-diagnosis-settings";
import { diagnosisSettingsSchema } from "../schemas/admin-settings.schema";
import type { TDiagnosisSettingsAdmin, TDiagnosisSettingsFormValues } from "../types/admin-settings.types";
import {
  SETTINGS_ERROR_FIELDS,
  toDiagnosisSettingsFormValues,
  toUpdateDiagnosisSettingsInput,
} from "../utils/diagnosis-settings-form.util";

const INVALID_SETTINGS = "DIAGNOSIS_INVALID_SETTINGS";
const CROP_NOT_SUPPORTED = "DIAGNOSIS_CROP_NOT_SUPPORTED";


const range = ({ min, max }: { min: number; max: number }, unit = "") => `Từ ${min}${unit} đến ${max}${unit}`;

export type TDiagnosisSettingsFormProps = { className?: string };

/**
 * Cài đặt chẩn đoán (Specs/19102026/admin.md): số lượt miễn phí / ngày, cây mặc định của form, số ảnh tối đa,
 * dung lượng (MB) và kích thước (px) mỗi ảnh. Giới hạn giống server (DIAGNOSIS_SETTINGS_BOUNDS).
 */
export function DiagnosisSettingsForm({ className }: TDiagnosisSettingsFormProps) {
  const settings = useAdminDiagnosisSettings();

  if (settings.isPending) {
    return (
      <div aria-busy aria-label="Đang tải cài đặt" className={cn("card-normal flex flex-col gap-4 rounded-xl p-5", className)}>
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-16 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (settings.isError) {
    return (
      <Callout
        tone="danger"
        role="alert"
        title="Không tải được cài đặt chẩn đoán"
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

  return <SettingsForm settings={settings.data} className={className} />;
}

function SettingsForm({ settings, className }: { settings: TDiagnosisSettingsAdmin; className?: string }) {
  const crops = useCrops();
  const update = useUpdateDiagnosisSettings();
  const form = useAppForm<TDiagnosisSettingsFormValues>({
    schema: diagnosisSettingsSchema,
    defaultValues: toDiagnosisSettingsFormValues(settings),
  });
  const { errors, isDirty, isSubmitting } = form.formState;
  const defaultCrop = form.watch("defaultCropType");

  // Dữ liệu mới từ server (lưu xong / refetch) → làm mới form nếu chưa sửa dở.
  useEffect(() => {
    if (!form.formState.isDirty) form.reset(toDiagnosisSettingsFormValues(settings));
  }, [settings, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const saved = await update.mutateAsync(toUpdateDiagnosisSettingsInput(values));
      form.reset(toDiagnosisSettingsFormValues(saved));
      toast.success("Đã lưu cài đặt chẩn đoán");
    } catch (error) {
      const field = isAppError(error)
        ? error.code === CROP_NOT_SUPPORTED
          ? "defaultCropType"
          : error.code === INVALID_SETTINGS
            ? SETTINGS_ERROR_FIELDS[(error.details as { field?: string } | undefined)?.field ?? ""]
            : undefined
        : undefined;
      if (field && isAppError(error)) form.setError(field, { type: "server", message: error.message });
      else applyServerErrors(form, error);
    }
  });

  const numberField = (
    name: Exclude<keyof TDiagnosisSettingsFormValues, "defaultCropType">,
    label: string,
    description: string,
    step: number | "any" = 1,
  ) => (
    <FormField id={`diagnosis-settings-${name}`} label={label} description={description} required error={errors[name]?.message}>
      {(control) => (
        <Input
          {...control}
          {...form.register(name, { setValueAs: toNumberOrNull })}
          type="number"
          inputMode={step === 1 ? "numeric" : "decimal"}
          step={step}
          disabled={isSubmitting}
        />
      )}
    </FormField>
  );

  const rootError = errors.root?.server?.message;

  return (
    <form onSubmit={onSubmit} noValidate className={cn("card-normal flex flex-col gap-6 rounded-xl p-4 sm:p-6", className)}>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 text-base font-semibold">Lượt chẩn đoán</legend>
        {numberField(
          "dailyFreeLimit",
          "Số lượt miễn phí mỗi ngày",
          `${range(DIAGNOSIS_SETTINGS_BOUNDS.dailyFreeLimit)} — tính theo ngày giờ Việt Nam, mỗi tài khoản.`,
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 text-base font-semibold">Form chẩn đoán</legend>

        <FormField
          id="diagnosis-settings-defaultCropType"
          label="Cây trồng mặc định"
          description="Cây được chọn sẵn ở form chẩn đoán trang chủ. Không chọn → lúa (hoặc cây đầu tiên)."
          error={errors.defaultCropType?.message}
        >
          {(control) => (
            <Select
              value={defaultCrop}
              onValueChange={(value) => form.setValue("defaultCropType", value, { shouldDirty: true, shouldValidate: true })}
              disabled={isSubmitting || !crops.data}
            >
              <SelectTrigger className="w-full sm:w-72" {...control}>
                <SelectValue placeholder={crops.isPending ? "Đang tải…" : "Chọn cây"} />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={NO_DEFAULT_CROP}>Không chọn</SelectItem>
                {crops.data?.map((crop) => (
                  <SelectItem key={crop.code} value={crop.code}>
                    {crop.nameVi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("maxImages", "Số ảnh tối đa mỗi lần", range(DIAGNOSIS_SETTINGS_BOUNDS.maxImages, " ảnh"))}
          {numberField("maxImageMb", "Dung lượng tối đa mỗi ảnh (MB)", `${range(MAX_IMAGE_MB_BOUNDS, " MB")}, tối đa 2 chữ số thập phân`, "any")}
          {numberField("maxImageWidth", "Chiều rộng tối đa (px)", range(DIAGNOSIS_SETTINGS_BOUNDS.maxImageWidth, " px"))}
          {numberField("maxImageHeight", "Chiều cao tối đa (px)", range(DIAGNOSIS_SETTINGS_BOUNDS.maxImageHeight, " px"))}
        </div>
        <p className="text-xs text-muted-foreground">
          Ảnh được nén ở trình duyệt cho vừa giới hạn trước khi gửi (cạnh dài không quá 2048 px).
        </p>
      </fieldset>

      {rootError && (
        <p role="alert" className="text-sm text-destructive">
          {rootError}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!isDirty || isSubmitting}
          onClick={() => form.reset(toDiagnosisSettingsFormValues(settings))}
        >
          Huỷ thay đổi
        </Button>
        <Button type="submit" variant="highlight" loading={isSubmitting} disabled={!isDirty}>
          {!isSubmitting && <SaveIcon aria-hidden />}
          Lưu cài đặt
        </Button>
      </div>
    </form>
  );
}

