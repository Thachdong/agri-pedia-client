import { useAppQuery } from "@/shared/lib/query";
import { diagnosisSettingsQuery } from "./diagnosis.queries";

/** Thông số form chẩn đoán — lỗi không chặn form (dùng mặc định), nơi dùng tự quyết định khi cần báo. */
export const useDiagnosisSettings = () => useAppQuery({ ...diagnosisSettingsQuery(), meta: { silent: true } });
