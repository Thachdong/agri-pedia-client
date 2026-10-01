import { http, type IHttpClient, putToSignedUrl } from "@/shared/lib/http";
import type {
  TMediaType,
  TPresignFileInput,
  TPresignUrlsResponse,
  TUploadedMedia,
  TUploadFileInput,
} from "../types/media.types";
import { getFileExtension } from "../utils/file-extension.util";

/** 1..10 file; all-or-nothing — một file sai đuôi → 400 MEDIA_INVALID_EXTENSION, không cấp URL nào. */
export const presignUrls = (files: TPresignFileInput[], client: IHttpClient = http) =>
  client.post<TPresignUrlsResponse>("/media/presign-url", { files });

/**
 * Xin presign URL cho cả lô rồi PUT song song lên storage.
 * Trả `{ key, type, extension, filename }` cùng thứ tự `files` — gửi kèm request lưu (PATCH /users/me...).
 */
export async function uploadMedia<TType extends TMediaType>(
  files: TUploadFileInput<TType>[],
  client: IHttpClient = http,
): Promise<TUploadedMedia<TType>[]> {
  const metas = files.map(({ file, type }) => ({ filename: file.name, extension: getFileExtension(file.name), type }));
  const { items } = await presignUrls(metas, client);

  await Promise.all(
    items.map((item, index) => putToSignedUrl(item.presignUrl, files[index].file, { headers: item.headers })),
  );

  return items.map((item, index) => ({ ...metas[index], key: item.key }));
}
