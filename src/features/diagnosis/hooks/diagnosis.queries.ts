import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getDiagnosis, getMyDiagnoses } from "../services/diagnosis.service";

export const DIAGNOSES_PAGE_SIZE = 20;

export const diagnosisQuery = (id: string, client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.diagnoses.detail(id),
    queryFn: () => getDiagnosis(id, client),
  });

/** Lịch sử chẩn đoán của tôi, mới nhất trước (`nextCursor` null = hết). */
export const diagnosisHistoryQuery = (client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.diagnoses.lists(),
    queryFn: ({ pageParam }) => getMyDiagnoses({ cursor: pageParam, limit: DIAGNOSES_PAGE_SIZE }, client),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
