import { APP_ERROR_CODE, AppError } from "./app-error";

export type TPutToSignedUrlOptions = {
  /** Headers server trả kèm presign URL (Content-Type, `x-goog-content-length-range`) — phải gửi đúng y nguyên. */
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/**
 * PUT file thẳng lên signed URL của storage (URL tuyệt đối, không qua BFF, không kèm cookie).
 * Không dùng `http` vì client đó luôn ghép baseUrl `/api` và set `accept: application/json`.
 * Storage trả lỗi dạng XML → không đọc body, chỉ map status.
 */
export async function putToSignedUrl(url: string, file: Blob, { headers, signal }: TPutToSignedUrlOptions = {}) {
  let response: Response;
  try {
    response = await fetch(url, { method: "PUT", body: file, headers, credentials: "omit", signal });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new AppError({
      status: 0,
      code: APP_ERROR_CODE.NETWORK_ERROR,
      message: "Không thể tải file lên, vui lòng kiểm tra mạng",
    });
  }

  if (!response.ok) {
    throw new AppError({
      status: response.status,
      code: APP_ERROR_CODE.UPLOAD_FAILED,
      message: "Tải file lên thất bại (file quá 10MB, sai định dạng hoặc phiên tải đã hết hạn), vui lòng thử lại",
    });
  }
}
