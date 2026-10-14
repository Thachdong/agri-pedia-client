import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { createDiagnosis } from "../services/diagnosis.service";
import type { TCreateDiagnosisInput } from "../types/diagnosis.types";

/** Lỗi (ảnh không hợp lệ, hết lượt...) do form hiển thị tại chỗ → tắt thông báo global. */
export const useCreateDiagnosis = () =>
  useAppMutation({
    mutationFn: (input: TCreateDiagnosisInput) => createDiagnosis(input),
    invalidates: () => [queryKeys.diagnoses.lists()],
    meta: { silent: true },
  });
