import type { TApiSchema } from "@/shared/lib/http";
import type { TFileUpload } from "@/shared/types";

export type TPresignFileInput = TApiSchema<"PresignFileDto">;
export type TMediaType = TPresignFileInput["type"];

/** Spec không khai báo kiểu cho `headers` (sinh ra `Record<string, never>`) — thực tế là Content-Type + `x-goog-content-length-range`. */
export type TPresignedMedia = Omit<TApiSchema<"PresignedMediaResponse">, "headers"> & { headers: Record<string, string> };
export type TPresignUrlsResponse = Omit<TApiSchema<"GetPresignUrlResponse">, "items"> & { items: TPresignedMedia[] };

/** File đã lên TMP — đúng shape `AvatarFileDto` / `BusinessLicenseFileDto` để gửi kèm PATCH /users/me, POST /products... */
export type TUploadedMedia<TType extends TMediaType = TMediaType> = Omit<TPresignFileInput, "type"> & {
  type: TType;
  key: string;
};

/** Item form của ô chọn file upload-ngay-khi-chọn — `media` (khi done) gửi thẳng vào request lưu. */
export type TMediaUpload<TType extends TMediaType = TMediaType> = TFileUpload<TUploadedMedia<TType>>;
