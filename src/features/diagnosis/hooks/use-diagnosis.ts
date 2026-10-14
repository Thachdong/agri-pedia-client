import { useAppQuery } from "@/shared/lib/query";
import { diagnosisQuery } from "./diagnosis.queries";

export const useDiagnosis = (id: string) => useAppQuery(diagnosisQuery(id));
