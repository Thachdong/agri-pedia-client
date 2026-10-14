import { APP_ERROR_CODE, AppError } from "./app-error";

export type TPutToSignedUrlOptions = {
  /** Headers server trả kèm presign URL (Content-Type, `x-goog-content-length-range`) — phải gửi đúng y nguyên. */
  headers?: Record<string, string>;
  /** Abort → reject `DOMException` tên `AbortError` (giống fetch). */
  signal?: AbortSignal;
  /** % đã gửi (0..100, số nguyên); gọi 100 khi storage trả thành công. */
  onProgress?: (percent: number) => void;
};

const abortError = () => new DOMException("Upload aborted", "AbortError");

/**
 * PUT file thẳng lên signed URL của storage (URL tuyệt đối, không qua BFF, không kèm cookie).
 * Không dùng `http` vì client đó luôn ghép baseUrl `/api` và set `accept: application/json`.
 * Dùng XHR thay fetch vì fetch không báo tiến trình upload.
 * Storage trả lỗi dạng XML → không đọc body, chỉ map status.
 */
export function putToSignedUrl(
  url: string,
  file: Blob,
  { headers, signal, onProgress }: TPutToSignedUrlOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const xhr = new XMLHttpRequest();
    const onAbortSignal = () => xhr.abort();
    const settle = (finish: () => void) => {
      signal?.removeEventListener("abort", onAbortSignal);
      finish();
    };

    xhr.open("PUT", url);
    xhr.withCredentials = false;
    Object.entries(headers ?? {}).forEach(([name, value]) => xhr.setRequestHeader(name, value));

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
    }

    xhr.onload = () =>
      settle(() => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);
          resolve();
          return;
        }
        reject(
          new AppError({
            status: xhr.status,
            code: APP_ERROR_CODE.UPLOAD_FAILED,
            message: "Tải file lên thất bại (file quá 10MB, sai định dạng hoặc phiên tải đã hết hạn), vui lòng thử lại",
          }),
        );
      });
    xhr.onerror = () =>
      settle(() =>
        reject(
          new AppError({
            status: 0,
            code: APP_ERROR_CODE.NETWORK_ERROR,
            message: "Không thể tải file lên, vui lòng kiểm tra mạng",
          }),
        ),
      );
    xhr.onabort = () => settle(() => reject(abortError()));

    signal?.addEventListener("abort", onAbortSignal, { once: true });
    xhr.send(file);
  });
}
