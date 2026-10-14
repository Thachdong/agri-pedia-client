import { APP_ERROR_CODE, AppError, toAppError } from "./app-error";
import type { IHttpClient, TQueryParams, TRequestOptions } from "./http.types";

type THttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type TCreateHttpClientConfig = {
  baseUrl: string;
  credentials?: RequestCredentials;
  getHeaders?: () => HeadersInit | Promise<HeadersInit>;
  onError?: (error: AppError) => void;
};

function buildUrl(baseUrl: string, path: string, query?: TQueryParams): string {
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined && item !== null) params.append(key, String(item));
    }
  }
  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

function isRawBody(body: unknown): body is BodyInit {
  return body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text || undefined;
}

export function createHttpClient(config: TCreateHttpClientConfig): IHttpClient {
  async function request<T>(method: THttpMethod, path: string, body?: unknown, options?: TRequestOptions): Promise<T> {
    const headers = new Headers(await config.getHeaders?.());
    new Headers(options?.headers).forEach((value, key) => headers.set(key, value));
    if (!headers.has("accept")) headers.set("accept", "application/json");

    let payload: BodyInit | undefined;
    if (body !== undefined) {
      if (isRawBody(body)) {
        payload = body;
      } else {
        payload = JSON.stringify(body);
        headers.set("content-type", "application/json");
      }
    }

    let response: Response;
    try {
      response = await fetch(buildUrl(config.baseUrl, path, options?.query), {
        method,
        headers,
        body: payload,
        credentials: config.credentials,
        signal: options?.signal,
        cache: options?.cache,
      });
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
      const error = new AppError({
        status: 0,
        code: APP_ERROR_CODE.NETWORK_ERROR,
        message: "Không thể kết nối máy chủ, vui lòng kiểm tra mạng",
      });
      config.onError?.(error);
      throw error;
    }

    const data = await parseBody(response);
    if (!response.ok) {
      const error = toAppError(response.status, data);
      config.onError?.(error);
      throw error;
    }
    return data as T;
  }

  return {
    get: (path, options) => request("GET", path, undefined, options),
    delete: (path, options) => request("DELETE", path, undefined, options),
    post: (path, body, options) => request("POST", path, body, options),
    put: (path, body, options) => request("PUT", path, body, options),
    patch: (path, body, options) => request("PATCH", path, body, options),
  };
}
