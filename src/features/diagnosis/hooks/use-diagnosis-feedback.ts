import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { submitDiagnosisFeedback } from "../services/diagnosis.service";
import type { TDiagnosisFeedbackInput } from "../types/diagnosis.types";

/** Chỉ `userFeedback` của chi tiết đổi — list không hiện phản hồi. Lỗi do form hiển thị tại chỗ. */
export const useDiagnosisFeedback = (id: string) =>
  useAppMutation({
    mutationFn: (input: TDiagnosisFeedbackInput) => submitDiagnosisFeedback(id, input),
    invalidates: () => [queryKeys.diagnoses.detail(id)],
    meta: { silent: true },
  });
