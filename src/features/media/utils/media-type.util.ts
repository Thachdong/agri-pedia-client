import { MEDIA_ALLOWED_EXTENSIONS } from "../constants/media.constants";
import type { TMediaType } from "../types/media.types";
import { getFileExtension } from "./file-extension.util";

/** Đuôi file các loại `types` chấp nhận (gộp, giữ thứ tự). */
export const getMediaExtensions = (types: readonly TMediaType[]): string[] =>
  types.flatMap((type) => MEDIA_ALLOWED_EXTENSIONS[type]);

/** Giá trị `accept` cho `<input type="file">` (vd. ".jpg,.jpeg,.png,.webp"). */
export const getMediaAccept = (types: readonly TMediaType[]) =>
  getMediaExtensions(types)
    .map((extension) => `.${extension}`)
    .join(",");

/** Loại media đầu tiên trong `types` nhận đuôi của file (vd. giấy phép .pdf → FILE, .jpg → IMAGE); không loại nào → null. */
export function resolveMediaType<TType extends TMediaType>(file: File, types: readonly TType[]): TType | null {
  const extension = getFileExtension(file.name);
  return types.find((type) => (MEDIA_ALLOWED_EXTENSIONS[type] as readonly string[]).includes(extension)) ?? null;
}
