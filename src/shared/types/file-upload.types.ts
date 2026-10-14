export type TFileUploadStatus = "uploading" | "done";

/**
 * File đã chọn và đang / đã upload ngay lúc chọn — giá trị form của ô chọn file (FileInputField, MultiImageInput).
 * `id` ổn định suốt vòng đời item (key list, abort đúng upload); `progress` 0..100.
 * `media` là kết quả upload (vd. TUploadedMedia của feature media) — chỉ có khi `done`.
 * Upload lỗi thì item bị bỏ khỏi form nên không có trạng thái lỗi.
 */
export type TFileUpload<TMedia = unknown> = {
  id: string;
  file: File;
  progress: number;
} & ({ status: "uploading"; media: null } | { status: "done"; media: TMedia });
