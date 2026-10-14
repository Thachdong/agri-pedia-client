// Public API của feature `diagnosis` (chẩn đoán bệnh cây trồng + bài viết bệnh).
export { diagnosisHistoryQuery, diagnosisQuery } from "./hooks/diagnosis.queries";
export { cropsQuery, diseaseQuery } from "./hooks/knowledge.queries";
export { useCreateDiagnosis } from "./hooks/use-create-diagnosis";
export { useCrops } from "./hooks/use-crops";
export { useDiagnosis } from "./hooks/use-diagnosis";
export { useDiagnosisFeedback } from "./hooks/use-diagnosis-feedback";
export { useDiagnosisHistory } from "./hooks/use-diagnosis-history";
export { useDiagnosisLive } from "./hooks/use-diagnosis-live";
export { useDisease } from "./hooks/use-disease";
export type { TDiagnosis, TDiagnosisListItem, TDiagnosisStatus, TPlantPart } from "./types/diagnosis.types";
export type { TCrop, TDisease } from "./types/knowledge.types";
