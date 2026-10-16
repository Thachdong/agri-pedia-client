import { useAppInfiniteQuery } from "@/shared/lib/query";
import type { TDiagnosisListPage } from "../types/diagnosis.types";
import { diagnosisHistoryQuery } from "./diagnosis.queries";

const toItems = ({ pages }: { pages: TDiagnosisListPage[] }) => pages.flatMap((page) => page.diagnoses);

export const useDiagnosisHistory = () => useAppInfiniteQuery({ ...diagnosisHistoryQuery(), select: toItems });
