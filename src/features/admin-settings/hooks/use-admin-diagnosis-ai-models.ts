import { useAppQuery } from "@/shared/lib/query";
import { adminDiagnosisAiModelsQuery } from "./admin-settings.queries";

export const useAdminDiagnosisAiModels = () => useAppQuery(adminDiagnosisAiModelsQuery());
