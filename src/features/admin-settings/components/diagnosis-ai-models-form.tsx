"use client";

import { RefreshCwIcon, SaveIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { applyServerErrors, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { useAdminDiagnosisAiModels } from "../hooks/use-admin-diagnosis-ai-models";
import { useUpdateDiagnosisAiModels } from "../hooks/use-update-diagnosis-ai-models";
import { diagnosisAiModelsSchema } from "../schemas/admin-settings.schema";
import type { TDiagnosisAiModels, TDiagnosisAiModelsFormValues } from "../types/admin-settings.types";
import { toAiModelFormValue, toAiModelInput } from "../utils/ai-model-form.util";
import { AiModelField } from "./ai-model-field";

const INVALID_SETTINGS = "DIAGNOSIS_INVALID_SETTINGS";

const toFormValues = (models: TDiagnosisAiModels): TDiagnosisAiModelsFormValues => ({
  describeModel: toAiModelFormValue(models.describeModel),
  verifyModel: toAiModelFormValue(models.verifyModel),
});

export type TDiagnosisAiModelsFormProps = { className?: string };

/**
 * AI model của các bước chẩn đoán (GET / PUT /admin/diagnosis/ai-models): B1 mô tả ảnh, B3 xác minh.
 * Để trống = model env. Server không kiểm id có ở provider; áp cho ca tạo sau khi lưu.
 */
export function DiagnosisAiModelsForm({ className }: TDiagnosisAiModelsFormProps) {
  const models = useAdminDiagnosisAiModels();

  if (models.isPending) {
    return (
      <div aria-busy aria-label="Đang tải AI model" className={cn("card-normal flex flex-col gap-4 rounded-xl p-5", className)}>
        {[0, 1].map((index) => (
          <div key={index} className="h-20 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (models.isError) {
    return (
      <Callout
        tone="danger"
        role="alert"
        title="Không tải được AI model chẩn đoán"
        className={className}
        action={
          <Button size="sm" variant="outline" onClick={() => void models.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
      >
        {models.error.message}
      </Callout>
    );
  }

  return <ModelsForm models={models.data} className={className} />;
}

function ModelsForm({ models, className }: { models: TDiagnosisAiModels; className?: string }) {
  const update = useUpdateDiagnosisAiModels();
  const form = useAppForm<TDiagnosisAiModelsFormValues>({
    schema: diagnosisAiModelsSchema,
    defaultValues: toFormValues(models),
  });
  const { errors, isDirty, isSubmitting } = form.formState;
  const [describeModel, verifyModel] = form.watch(["describeModel", "verifyModel"]);

  // Dữ liệu mới từ server (lưu xong / refetch) → làm mới form nếu chưa sửa dở.
  useEffect(() => {
    if (!form.formState.isDirty) form.reset(toFormValues(models));
  }, [models, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const saved = await update.mutateAsync({
        describeModel: toAiModelInput(values.describeModel),
        verifyModel: toAiModelInput(values.verifyModel),
      });
      form.reset(toFormValues(saved));
      toast.success("Đã lưu AI model chẩn đoán");
    } catch (error) {
      const field = isAppError(error) && error.code === INVALID_SETTINGS
        ? (error.details as { field?: string } | undefined)?.field
        : undefined;
      if ((field === "describeModel" || field === "verifyModel") && isAppError(error)) {
        form.setError(field, { type: "server", message: error.message });
      } else applyServerErrors(form, error);
    }
  });

  const resetToDefault = (name: keyof TDiagnosisAiModelsFormValues) =>
    form.setValue(name, "", { shouldDirty: true, shouldValidate: true });

  const rootError = errors.root?.server?.message;

  return (
    <form onSubmit={onSubmit} noValidate className={cn("card-normal flex flex-col gap-6 rounded-xl p-4 sm:p-6", className)}>
      <Callout tone="warning" title="Kiểm tra kỹ model id trước khi lưu">
        Hệ thống không kiểm tra model có tồn tại ở AI provider — id sai làm chẩn đoán thất bại. Thay đổi áp dụng cho
        các ca chẩn đoán tạo sau khi lưu.
      </Callout>

      <AiModelField
        id="diagnosis-ai-describe-model"
        label="Bước 1 — Mô tả ảnh"
        description="Đọc ảnh, đánh giá chất lượng và khoanh vùng tổn thương."
        defaultModel={models.defaults.describeModel}
        value={describeModel}
        error={errors.describeModel?.message}
        disabled={isSubmitting}
        inputProps={form.register("describeModel")}
        onUseDefault={() => resetToDefault("describeModel")}
      />
      <AiModelField
        id="diagnosis-ai-verify-model"
        label="Bước 3 — Xác minh bệnh"
        description="So từng vùng với các bệnh ứng viên và chọn kết quả."
        defaultModel={models.defaults.verifyModel}
        value={verifyModel}
        error={errors.verifyModel?.message}
        disabled={isSubmitting}
        inputProps={form.register("verifyModel")}
        onUseDefault={() => resetToDefault("verifyModel")}
      />

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
          onClick={() => form.reset(toFormValues(models))}
        >
          Huỷ thay đổi
        </Button>
        <Button type="submit" variant="highlight" loading={isSubmitting} disabled={!isDirty}>
          {!isSubmitting && <SaveIcon aria-hidden />}
          Lưu AI model
        </Button>
      </div>
    </form>
  );
}
