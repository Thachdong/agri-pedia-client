import { http, type IHttpClient, type TRequestOptions } from "@/shared/lib/http";
import type { TArticleCropsResponse } from "../types/article.types";

/*
 * Public — mọi hàm nhận `options` để page server truyền cache của Next (`articleFetchOptions`).
 * Route ISR dùng `publicServerHttp` (không đọc cookie); "Xem thêm" phía client dùng `http` (BFF).
 */

/** Cây có bài viết, theo thứ tự hiển thị. */
export const listArticleCrops = (client: IHttpClient = http, options?: TRequestOptions) =>
  client.get<TArticleCropsResponse>("/knowledge/articles/crops", options);
