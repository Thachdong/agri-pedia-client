import type { IHttpClient } from "@/shared/lib/http";
import { appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getCrops, getDisease } from "../services/knowledge.service";

/** Danh mục cây trồng gần như không đổi trong phiên. */
export const cropsQuery = (client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.knowledge.crops(),
    queryFn: () => getCrops(client),
    staleTime: Infinity,
  });

/** Bài viết bệnh chỉ đổi khi cập nhật knowledge base → cache lâu, dùng chung giữa trang kết quả và trang bệnh. */
export const diseaseQuery = (code: string, client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.knowledge.disease(code),
    queryFn: () => getDisease(code, client),
    staleTime: 30 * 60_000,
  });
