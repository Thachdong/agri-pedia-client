import { http, type IHttpClient, putToSignedUrl, type TPutToSignedUrlOptions } from "@/shared/lib/http";
import type {
  TMediaType,
  TPresignedMedia,
  TPresignFileInput,
  TPresignUrlsResponse,
  TUploadedMedia,
  TUploadFileInput,
} from "../types/media.types";
import { getFileExtension } from "../utils/file-extension.util";

/** 1..10 file; all-or-nothing — một file sai đuôi → 400 MEDIA_INVALID_EXTENSION, không cấp URL nào. */
export const presignUrls = (files: TPresignFileInput[], client: IHttpClient = http, signal?: AbortSignal) =>
  client.post<TPresignUrlsResponse>("/media/presign-url", { files }, { signal });

/** Metadata gửi xin presign — cũng là phần còn lại của `TUploadedMedia` (thiếu `key`). */
export const toPresignFile = <TType extends TMediaType>(file: File, type: TType) => ({
  filename: file.name,
  extension: getFileExtension(file.name),
  type,
});

/** PUT 1 file lên URL đã presign, kèm đúng headers server cấp. */
export const putMediaFile = (
  presigned: TPresignedMedia,
  file: File,
  options: Omit<TPutToSignedUrlOptions, "headers"> = {},
) => putToSignedUrl(presigned.presignUrl, file, { ...options, headers: presigned.headers });

/**
 * Xin presign URL cho cả lô rồi PUT song song lên storage.
 * Trả `{ key, type, extension, filename }` cùng thứ tự `files` — gửi kèm request lưu (PATCH /users/me...).
 * @deprecated Dùng `useMediaUploads` (upload ngay khi chọn file) — bỏ khi các form đã chuyển xong.
 */
export async function uploadMedia<TType extends TMediaType>(
  files: TUploadFileInput<TType>[],
  client: IHttpClient = http,
): Promise<TUploadedMedia<TType>[]> {
  const metas = files.map(({ file, type }) => toPresignFile(file, type));
  const { items } = await presignUrls(metas, client);

  await Promise.all(items.map((item, index) => putMediaFile(item, files[index].file)));

  return items.map((item, index) => ({ ...metas[index], key: item.key }));
}
