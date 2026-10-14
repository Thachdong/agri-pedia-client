"use client";

import { CheckIcon, HelpCircleIcon, XIcon } from "lucide-react";
import { Button, Textarea } from "@/shared/components/atoms";
import { FormField } from "@/shared/components/molecules";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { DIAGNOSIS_ERROR_CODE, FEEDBACK_COMMENT_MAX, FEEDBACK_OPTIONS } from "../constants/diagnosis.constants";
import { useDiagnosisFeedback } from "../hooks/use-diagnosis-feedback";
import { diagnosisFeedbackSchema } from "../schemas/diagnosis.schema";
import type { TDiagnosis, TDiagnosisFeedbackFormValues, TDiagnosisFeedbackValue } from "../types/diagnosis.types";

const FORM_ID = "diagnosis-feedback";

const FEEDBACK_ICONS: Record<TDiagnosisFeedbackValue, React.ReactNode> = {
  CORRECT: <CheckIcon aria-hidden />,
  WRONG: <XIcon aria-hidden />,
  UNSURE: <HelpCircleIcon aria-hidden />,
};

export type TDiagnosisFeedbackProps = {
  diagnosis: Pick<TDiagnosis, "id" | "userFeedback">;
  className?: string;
};

/** Phản hồi kết quả (chỉ khi COMPLETED): Đúng / Sai / Không chắc + bình luận; đã phản hồi → chọn sẵn, gửi lại = ghi đè. */
export function DiagnosisFeedback({ diagnosis, className }: TDiagnosisFeedbackProps) {
  const feedback = useDiagnosisFeedback(diagnosis.id);
  const form = useAppForm<TDiagnosisFeedbackFormValues>({
    schema: diagnosisFeedbackSchema,
    defaultValues: { feedback: diagnosis.userFeedback ?? "", comment: "" },
  });
  const { errors, isSubmitted, isSubmitting } = form.formState;
  const selected = form.watch("feedback");
  const commentLength = form.watch("comment").length;

  const onSubmit = form.handleSubmit(async ({ feedback: value, comment }) => {
    try {
      await feedback.mutateAsync({ feedback: value as TDiagnosisFeedbackValue, comment: comment.trim() || undefined });
      toast.success("Cảm ơn bạn đã phản hồi");
    } catch (error) {
      if (isAppError(error) && error.code === DIAGNOSIS_ERROR_CODE.notCompleted) {
        toast.error("Chẩn đoán chưa hoàn tất, chưa thể gửi phản hồi");
        return;
      }
      if (!applyServerErrors(form, error)) {
        form.setError(FORM_ROOT_ERROR, { type: "server", message: "Gửi phản hồi thất bại, vui lòng thử lại" });
      }
    }
  });

  const rootError = errors.root?.server?.message;
  const feedbackError = errors.feedback?.message;

  return (
    <section aria-labelledby={`${FORM_ID}-title`} className={cn("card-normal rounded-xl p-4 sm:p-5", className)}>
      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={`${FORM_ID}-title`} className="text-lg font-semibold">
            Kết quả này có đúng không?
          </h2>
          <p className="text-sm text-muted-foreground">
            {diagnosis.userFeedback ? "Bạn đã phản hồi — gửi lại sẽ thay phản hồi cũ." : "Phản hồi giúp cải thiện chẩn đoán."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div role="group" aria-label="Đánh giá kết quả" className="grid grid-cols-3 gap-2">
            {FEEDBACK_OPTIONS.map((option) => {
              const active = selected === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={active ? "normal" : "outline"}
                  aria-pressed={active}
                  disabled={isSubmitting}
                  onClick={() => form.setValue("feedback", option.value, { shouldDirty: true, shouldValidate: isSubmitted })}
                  className="px-2"
                >
                  {FEEDBACK_ICONS[option.value]}
                  {option.label}
                </Button>
              );
            })}
          </div>
          {feedbackError && (
            <p role="alert" className="text-xs text-destructive">
              {feedbackError}
            </p>
          )}
        </div>

        <FormField
          id={`${FORM_ID}-comment`}
          label="Góp ý thêm (tuỳ chọn)"
          error={errors.comment?.message}
          description={`${commentLength}/${FEEDBACK_COMMENT_MAX} ký tự`}
        >
          {(control) => (
            <Textarea
              {...control}
              {...form.register("comment")}
              rows={3}
              maxLength={FEEDBACK_COMMENT_MAX}
              placeholder="Vd. bệnh thực tế là gì, vùng nào khoanh sai…"
              disabled={isSubmitting}
              className="resize-none"
            />
          )}
        </FormField>

        {rootError && (
          <p role="alert" className="text-sm text-destructive">
            {rootError}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="highlight" loading={isSubmitting}>
            Gửi phản hồi
          </Button>
        </div>
      </form>
    </section>
  );
}
