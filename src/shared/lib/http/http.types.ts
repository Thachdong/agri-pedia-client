type TQueryValue = string | number | boolean | null | undefined;

export type TQueryParams = Record<string, TQueryValue | TQueryValue[]>;

export type TRequestOptions = {
  query?: TQueryParams;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
};

/** Client HTTP của project — services nhận client này làm tham số (mặc định: browser `http`). */
export interface IHttpClient {
  get<T>(path: string, options?: TRequestOptions): Promise<T>;
  delete<T>(path: string, options?: TRequestOptions): Promise<T>;
  post<T, B = unknown>(path: string, body?: B, options?: TRequestOptions): Promise<T>;
  put<T, B = unknown>(path: string, body?: B, options?: TRequestOptions): Promise<T>;
  patch<T, B = unknown>(path: string, body?: B, options?: TRequestOptions): Promise<T>;
}
