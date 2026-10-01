import type { TApiSchema } from "@/shared/lib/http";

export type TPresignFileInput = TApiSchema<"PresignFileDto">;
export type TMediaType = TPresignFileInput["type"];

/** Spec không khai báo kiểu cho `headers` (sinh ra `Record<string, never>`) — thực tế là Content-Type + `x-goog-content-length-range`. */
export type TPresignedMedia = Omit<TApiSchema<"PresignedMediaResponse">, "headers"> & { headers: Record<string, string> };
export type TPresignUrlsResponse = Omit<TApiSchema<"GetPresignUrlResponse">, "items"> & { items: TPresignedMedia[] };

/** Một file cần upload và loại media server dùng để kiểm tra đuôi file. */
export type TUploadFileInput<TType extends TMediaType = TMediaType> = { file: File; type: TType };

/** File đã lên TMP — đúng shape `AvatarFileDto` / `BusinessLicenseFileDto` để gửi kèm PATCH /users/me, POST /products... */
export type TUploadedMedia<TType extends TMediaType = TMediaType> = Omit<TPresignFileInput, "type"> & {
  type: TType;
  key: string;
};
