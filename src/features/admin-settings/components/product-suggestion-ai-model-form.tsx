"use client";

import { RefreshCwIcon, SaveIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { applyServerErrors, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { useProductSuggestionAiModel } from "../hooks/use-product-suggestion-ai-model";
import { useUpdateProductSuggestionAiModel } from "../hooks/use-update-product-suggestion-ai-model";
import { productSuggestionAiModelSchema } from "../schemas/admin-settings.schema";
import type { TProductSuggestionAiModel, TProductSuggestionAiModelFormValues } from "../types/admin-settings.types";
import { toAiModelFormValue, toAiModelInput } from "../utils/ai-model-form.util";
import { AiModelField } from "./ai-model-field";

const INVALID_SETTINGS = "PRODUCT_SUGGESTION_INVALID_SETTINGS";

const toFormValues = (model: TProductSuggestionAiModel): TProductSuggestionAiModelFormValues => ({
  model: toAiModelFormValue(model.model),
});

export type TProductSuggestionAiModelFormProps = { className?: string };

/**
 * AI model đọc tên sản phẩm từ ảnh khi distributor tạo sản phẩm (GET / PUT /admin/product-suggestion/ai-model).
 * Để trống = model env. Server không kiểm id có ở provider; áp cho lần gợi ý kế tiếp.
 */
export function ProductSuggestionAiModelForm({ className }: TProductSuggestionAiModelFormProps) {
  const model = useProductSuggestionAiModel();

  if (model.isPending) {
    return (
      <div aria-busy aria-label="Đang tải AI model" className={cn("card-normal flex flex-col gap-4 rounded-xl p-5", className)}>
        <div className="h-20 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (model.isError) {
    return (
      <Callout
        tone="danger"
        role="alert"
        title="Không tải được AI model tạo sản phẩm"
        className={className}
        action={
          <Button size="sm" variant="outline" onClick={() => void model.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
      >
        {model.error.message}
      </Callout>
    );
  }

  return <ModelForm model={model.data} className={className} />;
}

function ModelForm({ model, className }: { model: TProductSuggestionAiModel; className?: string }) {
  const update = useUpdateProductSuggestionAiModel();
  const form = useAppForm<TProductSuggestionAiModelFormValues>({
    schema: productSuggestionAiModelSchema,
    defaultValues: toFormValues(model),
  });
  const { errors, isDirty, isSubmitting } = form.formState;
  const value = form.watch("model");

  // Dữ liệu mới từ server (lưu xong / refetch) → làm mới form nếu chưa sửa dở.
  useEffect(() => {
    if (!form.formState.isDirty) form.reset(toFormValues(model));
  }, [model, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const saved = await update.mutateAsync({ model: toAiModelInput(values.model) });
      form.reset(toFormValues(saved));
      toast.success("Đã lưu AI model tạo sản phẩm");
    } catch (error) {
      if (isAppError(error) && error.code === INVALID_SETTINGS) {
        form.setError("model", { type: "server", message: error.message });
      } else applyServerErrors(form, error);
    }
  });

  const rootError = errors.root?.server?.message;

  return (
    <form onSubmit={onSubmit} noValidate className={cn("card-normal flex flex-col gap-6 rounded-xl p-4 sm:p-6", className)}>
      <Callout tone="warning" title="Kiểm tra kỹ model id trước khi lưu">
        Hệ thống không kiểm tra model có tồn tại ở AI provider — id sai làm gợi ý sản phẩm thất bại. Thay đổi áp dụng
        từ lần gợi ý kế tiếp.
      </Callout>

      <AiModelField
        id="product-suggestion-ai-model"
        label="Đọc tên sản phẩm từ ảnh"
        description="Dùng khi nhà phân phối chụp nhãn để điền sẵn thông tin sản phẩm."
        defaultModel={model.defaults.model}
        value={value}
        error={errors.model?.message}
        disabled={isSubmitting}
        inputProps={form.register("model")}
        onUseDefault={() => form.setValue("model", "", { shouldDirty: true, shouldValidate: true })}
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
          onClick={() => form.reset(toFormValues(model))}
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
