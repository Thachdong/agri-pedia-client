import { http, type IHttpClient, putToSignedUrl, type TPutToSignedUrlOptions } from "@/shared/lib/http";
import type { TMediaType, TPresignedMedia, TPresignFileInput, TPresignUrlsResponse } from "../types/media.types";
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
