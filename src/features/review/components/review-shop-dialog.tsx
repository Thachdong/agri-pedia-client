"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  StarRatingInput,
  Textarea,
} from "@/shared/components/atoms";
import { FormField } from "@/shared/components/molecules";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { REVIEW_CONTENT_MAX, REVIEW_ERROR_CODE, REVIEW_SHOP_ERROR_MESSAGES } from "../constants/review.constants";
import { useCreateReview } from "../hooks/use-create-review";
import { reviewSchema } from "../schemas/review.schema";
import type { TReviewFormValues } from "../types/review.types";

export type TReviewShopDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distributorId: string;
  distributorName: string;
  /** Gửi thành công, hoặc server báo đã review từ trước — bên gọi nên ẩn/khoá nút "Đánh giá". */
  onReviewed?: () => void;
};

const DEFAULT_VALUES: TReviewFormValues = { star: 0, content: "" };

/**
 * M4 — đánh giá shop (ui-ux.md §7): chọn sao + nội dung, POST /reviews targetType USER.
 * Không có API kiểm tra "đã review chưa" → dựa vào 409 REVIEW_ALREADY_EXISTS: khoá form + thông báo.
 */
export function ReviewShopDialog({ open, onOpenChange, distributorId, distributorName, onReviewed }: TReviewShopDialogProps) {
  const createReview = useCreateReview();
  const form = useAppForm<TReviewFormValues>({ schema: reviewSchema, defaultValues: DEFAULT_VALUES });
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const { errors, isSubmitted, isSubmitting } = form.formState;

  const star = form.watch("star");
  const contentLength = form.watch("content").length;
  const locked = alreadyReviewed || isSubmitting;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset(DEFAULT_VALUES);
      createReview.reset();
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createReview.mutateAsync({ targetType: "USER", targetId: distributorId, ...values });
      onReviewed?.();
      handleOpenChange(false);
    } catch (error) {
      const message = isAppError(error) ? REVIEW_SHOP_ERROR_MESSAGES[error.code] : undefined;
      if (isAppError(error) && error.code === REVIEW_ERROR_CODE.ALREADY_EXISTS) {
        setAlreadyReviewed(true);
        onReviewed?.();
      }
      if (message) form.setError(FORM_ROOT_ERROR, { type: "server", message });
      else applyServerErrors(form, error);
    }
  });

  const rootError = errors.root?.server?.message;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh giá shop</DialogTitle>
          <DialogDescription>Chia sẻ trải nghiệm của bạn với {distributorName}.</DialogDescription>
        </DialogHeader>

        <form id="review-shop-form" onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <FormField id="review-star" label="Số sao" required error={errors.star?.message}>
            {(control) => (
              <StarRatingInput
                name="review-star"
                value={star}
                onChange={(next) => form.setValue("star", next, { shouldDirty: true, shouldValidate: isSubmitted })}
                disabled={locked}
                aria-describedby={control["aria-describedby"]}
                aria-invalid={control["aria-invalid"]}
              />
            )}
          </FormField>

          <FormField
            id="review-content"
            label="Nội dung"
            required
            error={errors.content?.message}
            description={`${contentLength}/${REVIEW_CONTENT_MAX} ký tự`}
          >
            {(control) => (
              <Textarea
                {...control}
                {...form.register("content")}
                rows={5}
                maxLength={REVIEW_CONTENT_MAX}
                placeholder="Chất lượng sản phẩm, tư vấn, giao hàng…"
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
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {alreadyReviewed ? "Đóng" : "Huỷ"}
          </Button>
          <Button type="submit" form="review-shop-form" variant="highlight" loading={isSubmitting} disabled={alreadyReviewed}>
            Gửi đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
