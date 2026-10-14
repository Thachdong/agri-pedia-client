import { useCallback, useEffect, useRef } from "react";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { MEDIA_MAX_FILE_BYTES } from "../constants/media.constants";
import { presignUrls, putMediaFile, toPresignFile } from "../services/media.service";
import type { TMediaType, TMediaUpload } from "../types/media.types";
import { getMediaExtensions, resolveMediaType } from "../utils/media-type.util";

export type TUseMediaUploadsOptions<TType extends TMediaType> = {
  /** Loại media field nhận — quyết định đuôi hợp lệ và `type` gửi server (file khớp loại đầu tiên). */
  types: readonly TType[];
  /** Item đổi tiến trình hoặc xong (`status: "done"`, có `media`) — ghi đè item cùng `id` trong form. */
  onUpdate: (upload: TMediaUpload<TType>) => void;
  /** Upload lỗi (đã toast) — bỏ item `id` khỏi form. */
  onFail: (id: string) => void;
};

let sequence = 0;
const nextUploadId = () => `media-upload-${++sequence}`;

const errorMessage = (error: unknown) =>
  isAppError(error) ? error.message : "Đã có lỗi xảy ra, vui lòng thử lại";
const isAbortError = (error: unknown) => error instanceof DOMException && error.name === "AbortError";
const toastFailed = (file: File, description: string) => toast.error(`Không tải được "${file.name}"`, { description });

/**
 * Upload ngay khi chọn file: kiểm tra đuôi / dung lượng → 1 lần presign cho cả lượt chọn → PUT song song (có %).
 * Form giữ các item (`start` trả item ban đầu); hook chỉ chạy upload và báo lại qua `onUpdate` / `onFail`.
 * File sai bị loại ngay (toast), không gửi server. `cancel` khi bỏ item; unmount → huỷ mọi upload đang chạy.
 * Không dùng useAppMutation: cần trạng thái + abort riêng từng file; chỉ lên TMP nên không query nào stale.
 */
export function useMediaUploads<const TType extends TMediaType>({ types, onUpdate, onFail }: TUseMediaUploadsOptions<TType>) {
  const latest = useRef({ types, onUpdate, onFail });
  useEffect(() => {
    latest.current = { types, onUpdate, onFail };
  });

  // Upload còn sống ↔ có controller; thiếu = đã xong / đã huỷ / đã unmount → bỏ qua mọi kết quả về sau.
  const controllers = useRef(new Map<string, AbortController>());
  useEffect(() => {
    const active = controllers.current;
    return () => {
      active.forEach((controller) => controller.abort());
      active.clear();
    };
  }, []);

  const cancel = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
  }, []);

  const run = useCallback(async (uploads: TMediaUpload<TType>[], uploadTypes: TType[]) => {
    const active = controllers.current;
    const metas = uploads.map((upload, index) => toPresignFile(upload.file, uploadTypes[index]));

    let items;
    try {
      ({ items } = await presignUrls(metas));
    } catch (error) {
      uploads
        .filter((upload) => active.has(upload.id))
        .forEach((upload) => {
          active.delete(upload.id);
          toastFailed(upload.file, errorMessage(error));
          latest.current.onFail(upload.id);
        });
      return;
    }

    await Promise.all(
      uploads.map(async (upload, index) => {
        const controller = active.get(upload.id);
        if (!controller) return;
        let lastPercent = 0;
        try {
          await putMediaFile(items[index], upload.file, {
            signal: controller.signal,
            onProgress: (percent) => {
              // 100 chỉ báo cùng `done` để không có item uploading 100%.
              if (percent === lastPercent || percent >= 100) return;
              lastPercent = percent;
              latest.current.onUpdate({ ...upload, progress: percent });
            },
          });
          if (!active.delete(upload.id)) return;
          latest.current.onUpdate({
            id: upload.id,
            file: upload.file,
            progress: 100,
            status: "done",
            media: { ...metas[index], key: items[index].key },
          });
        } catch (error) {
          if (isAbortError(error) || !active.delete(upload.id)) return;
          toastFailed(upload.file, errorMessage(error));
          latest.current.onFail(upload.id);
        }
      }),
    );
  }, []);

  /** Nhận file vừa chọn → trả item `uploading` (0%) của các file hợp lệ để đưa vào form ngay; upload chạy nền. */
  const start = useCallback(
    (files: File[]): TMediaUpload<TType>[] => {
      const { types: allowedTypes } = latest.current;
      const accepted: { file: File; type: TType }[] = [];
      files.forEach((file) => {
        const type = resolveMediaType(file, allowedTypes);
        if (!type) toastFailed(file, `Chỉ nhận file ${getMediaExtensions(allowedTypes).join(", ")}`);
        else if (file.size > MEDIA_MAX_FILE_BYTES) toastFailed(file, "File vượt quá 10MB");
        else accepted.push({ file, type });
      });
      if (accepted.length === 0) return [];

      const uploads: TMediaUpload<TType>[] = accepted.map(({ file }) => ({
        id: nextUploadId(),
        file,
        progress: 0,
        status: "uploading",
        media: null,
      }));
      uploads.forEach((upload) => controllers.current.set(upload.id, new AbortController()));
      void run(
        uploads,
        accepted.map(({ type }) => type),
      );
      return uploads;
    },
    [run],
  );

  return { start, cancel };
}
