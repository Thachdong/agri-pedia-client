"use client";

import { useState } from "react";
import { Button, StarRatingInput, Textarea } from "@/shared/components/atoms";
import { FormField } from "@/shared/components/molecules";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { cn } from "@/shared/lib/utils";
import {
  REVIEW_CONTENT_MAX,
  REVIEW_CONTENT_PLACEHOLDER,
  REVIEW_ERROR_CODE,
  REVIEW_ERROR_MESSAGES,
} from "../constants/review.constants";
import { useCreateReview } from "../hooks/use-create-review";
import { reviewSchema } from "../schemas/review.schema";
import type { TReviewFormValues, TReviewTargetType } from "../types/review.types";

export type TReviewFormActionsState = {
  submitting: boolean;
  /** Server báo đã review từ trước → form bị khoá. */
  alreadyReviewed: boolean;
};

export type TReviewFormProps = {
  /** id của `<form>` — nút submit đặt ngoài form (vd. DialogFooter) dùng `form={id}`. */
  id: string;
  targetType: TReviewTargetType;
  /** USER: distributor id; PRODUCT: product id. */
  targetId: string;
  onSuccess?: () => void;
  /** Server báo đã review từ trước (409) — form đã tự khoá + thông báo. */
  onAlreadyReviewed?: () => void;
  /** Thay khu nút mặc định (nút "Gửi đánh giá" bên phải) — render SAU `<form>`. */
  renderActions?: (state: TReviewFormActionsState) => React.ReactNode;
  className?: string;
};

const DEFAULT_VALUES: TReviewFormValues = { star: 0, content: "" };

/**
 * Form đánh giá (M4 shop / M5 sản phẩm): chọn sao + nội dung, POST /reviews.
 * Không có API "đã review chưa" → 409 REVIEW_ALREADY_EXISTS: khoá form + thông báo; 403: chưa đủ quyền.
 * Thành công → reset form (bên gọi thường ẩn form vì review của mình đã hiện trong list).
 */
export function ReviewForm({
  id,
  targetType,
  targetId,
  onSuccess,
  onAlreadyReviewed,
  renderActions,
  className,
}: TReviewFormProps) {
  const createReview = useCreateReview();
  const form = useAppForm<TReviewFormValues>({ schema: reviewSchema, defaultValues: DEFAULT_VALUES });
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const { errors, isSubmitted, isSubmitting } = form.formState;

  const star = form.watch("star");
  const contentLength = form.watch("content").length;
  const locked = alreadyReviewed || isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createReview.mutateAsync({ targetType, targetId, ...values });
      form.reset(DEFAULT_VALUES);
      onSuccess?.();
    } catch (error) {
      const message = isAppError(error) ? REVIEW_ERROR_MESSAGES[targetType][error.code] : undefined;
      if (isAppError(error) && error.code === REVIEW_ERROR_CODE.ALREADY_EXISTS) {
        setAlreadyReviewed(true);
        onAlreadyReviewed?.();
      }
      if (message) form.setError(FORM_ROOT_ERROR, { type: "server", message });
      else applyServerErrors(form, error);
    }
  });

  const rootError = errors.root?.server?.message;
  const state = { submitting: isSubmitting, alreadyReviewed };

  return (
    <>
      <form id={id} onSubmit={onSubmit} className={cn("flex flex-col gap-4", className)} noValidate>
        <FormField id={`${id}-star`} label="Số sao" required error={errors.star?.message}>
          {(control) => (
            <StarRatingInput
              name={`${id}-star`}
              value={star}
              onChange={(next) => form.setValue("star", next, { shouldDirty: true, shouldValidate: isSubmitted })}
              disabled={locked}
              aria-describedby={control["aria-describedby"]}
              aria-invalid={control["aria-invalid"]}
            />
          )}
        </FormField>

        <FormField
          id={`${id}-content`}
          label="Nội dung"
          required
          error={errors.content?.message}
          description={`${contentLength}/${REVIEW_CONTENT_MAX} ký tự`}
        >
          {(control) => (
            <Textarea
              {...control}
              {...form.register("content")}
              rows={4}
              maxLength={REVIEW_CONTENT_MAX}
              placeholder={REVIEW_CONTENT_PLACEHOLDER[targetType]}
              disabled={locked}
              className="resize-none"
            />
          )}
        </FormField>

        {rootError && (
          <p role="alert" className="text-sm text-destructive">
            {rootError}
          </p>
        )}

        {!renderActions && (
          <div className="flex justify-end">
            <Button type="submit" variant="highlight" loading={isSubmitting} disabled={alreadyReviewed}>
              Gửi đánh giá
            </Button>
          </div>
        )}
      </form>
      {renderActions?.(state)}
    </>
  );
}
