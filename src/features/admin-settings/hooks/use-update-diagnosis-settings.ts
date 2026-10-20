import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { updateDiagnosisSettings } from "../services/admin-settings.service";
import type { TUpdateDiagnosisSettingsInput } from "../types/admin-settings.types";

/** Lưu cài đặt chẩn đoán — bản admin và thông số form public (cây mặc định, giới hạn ảnh, lượt/ngày) bị stale. */
export const useUpdateDiagnosisSettings = () =>
  useAppMutation({
    // Lỗi hiện ngay trên form.
    meta: { silent: true },
    mutationFn: (input: TUpdateDiagnosisSettingsInput) => updateDiagnosisSettings(input),
    invalidates: () => [queryKeys.adminSettings.diagnosis(), queryKeys.diagnoses.settings()],
  });
