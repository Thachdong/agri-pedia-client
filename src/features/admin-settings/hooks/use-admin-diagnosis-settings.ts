import { useAppQuery } from "@/shared/lib/query";
import { adminDiagnosisSettingsQuery } from "./admin-settings.queries";

export const useAdminDiagnosisSettings = () => useAppQuery(adminDiagnosisSettingsQuery());
