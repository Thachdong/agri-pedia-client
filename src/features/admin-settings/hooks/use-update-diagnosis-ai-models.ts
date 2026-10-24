import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { updateDiagnosisAiModels } from "../services/admin-settings.service";
import type { TUpdateDiagnosisAiModelsInput } from "../types/admin-settings.types";

/** Lưu AI model các bước chẩn đoán — chỉ bản admin bị stale (form public không đọc model). */
export const useUpdateDiagnosisAiModels = () =>
  useAppMutation({
    // Lỗi hiện ngay trên form.
    meta: { silent: true },
    mutationFn: (input: TUpdateDiagnosisAiModelsInput) => updateDiagnosisAiModels(input),
    invalidates: () => [queryKeys.adminSettings.diagnosisAiModels()],
  });
