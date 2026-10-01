import { useAppMutation } from "@/shared/lib/query";
import { uploadMedia } from "../services/media.service";
import type { TMediaType, TUploadFileInput } from "../types/media.types";

/** Chỉ đưa file lên TMP — chưa đổi dữ liệu nào trên server nên không query nào stale; request lưu sau đó tự invalidate. */
export const useUploadMedia = <TType extends TMediaType = TMediaType>() =>
  useAppMutation({
    mutationFn: (files: TUploadFileInput<TType>[]) => uploadMedia(files),
    invalidates: false,
  });
