// Public API của feature `diagnosis` (chẩn đoán bệnh cây trồng + bài viết bệnh).
export { CropNotSupportedRedirect } from "./components/crop-not-supported-redirect";
export { DiagnosisForm, type TDiagnosisFormProps } from "./components/diagnosis-form";
export { DiagnosisHistoryList, type TDiagnosisHistoryListProps } from "./components/diagnosis-history-list";
export { DiagnosisResult, type TDiagnosisResultProps } from "./components/diagnosis-result";
export { DiseaseDetail, type TDiseaseDetailProps } from "./components/disease-detail";
export { StartDiagnosisButton, type TStartDiagnosisButtonProps } from "./components/start-diagnosis-button";
export { DIAGNOSIS_ERROR_CODE } from "./constants/diagnosis.constants";
export { diagnosisHistoryQuery, diagnosisQuery } from "./hooks/diagnosis.queries";
export { cropsQuery, diseaseQuery } from "./hooks/knowledge.queries";
export { useCreateDiagnosis } from "./hooks/use-create-diagnosis";
export { useCrops } from "./hooks/use-crops";
export { useDiagnosis } from "./hooks/use-diagnosis";
export { useDiagnosisFeedback } from "./hooks/use-diagnosis-feedback";
export { useDiagnosisHistory } from "./hooks/use-diagnosis-history";
export { useDisease } from "./hooks/use-disease";
export type { TDiagnosis, TDiagnosisListItem, TDiagnosisStatus, TPlantPart } from "./types/diagnosis.types";
export type { TCrop, TCropsResponse, TDisease } from "./types/knowledge.types";
