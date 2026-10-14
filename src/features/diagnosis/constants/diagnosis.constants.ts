import type {
  TConfidenceLevel,
  TDiagnosisFeedbackValue,
  TDiagnosisImageStatus,
  TDiagnosisStatus,
  TPlantPart,
} from "../types/diagnosis.types";
import type { TCropStage, TDiseaseAgentType, TDiseaseCategory } from "../types/knowledge.types";

/** Bộ phận cây — thứ tự dùng cho Select. */
export const PLANT_PART_OPTIONS = [
  { value: "LEAF", label: "Lá" },
  { value: "SHEATH", label: "Bẹ lá" },
  { value: "STEM", label: "Thân" },
  { value: "PANICLE", label: "Bông" },
  { value: "ROOT", label: "Rễ" },
  { value: "WHOLE_PLANT", label: "Cả cây" },
] as const satisfies readonly { value: TPlantPart; label: string }[];

export const PLANT_PARTS = PLANT_PART_OPTIONS.map((option) => option.value);

export const PLANT_PART_LABELS = Object.fromEntries(
  PLANT_PART_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<TPlantPart, string>;

export const CONFIDENCE_LABELS: Record<TConfidenceLevel, string> = {
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

export const CATEGORY_LABELS: Record<TDiseaseCategory, string> = {
  DISEASE: "Bệnh",
  PEST: "Sâu hại",
  DISORDER: "Rối loạn dinh dưỡng – sinh lý",
};

export const DIAGNOSIS_STATUS_LABELS: Record<TDiagnosisStatus, string> = {
  PROCESSING: "Đang phân tích",
  COMPLETED: "Hoàn tất",
  FAILED: "Lỗi",
};

export const IMAGE_STATUS_LABELS: Record<TDiagnosisImageStatus, string> = {
  DISEASED: "Có dấu hiệu bệnh",
  HEALTHY: "Khoẻ mạnh",
  UNCERTAIN: "Chưa xác định",
  NOT_TARGET_CROP: "Không phải cây cần chẩn đoán",
  LOW_QUALITY: "Ảnh chưa đủ rõ",
};

export const FEEDBACK_OPTIONS = [
  { value: "CORRECT", label: "Kết quả đúng" },
  { value: "WRONG", label: "Sai" },
  { value: "UNSURE", label: "Không chắc" },
] as const satisfies readonly { value: TDiagnosisFeedbackValue; label: string }[];

export const FEEDBACK_VALUES = FEEDBACK_OPTIONS.map((option) => option.value);

export const AGENT_TYPE_LABELS: Record<TDiseaseAgentType, string> = {
  FUNGUS: "Nấm",
  BACTERIA: "Vi khuẩn",
  VIRUS: "Virus",
  NEMATODE: "Tuyến trùng",
  INSECT: "Côn trùng",
  MITE: "Nhện hại",
  MOLLUSC: "Động vật thân mềm",
  VERTEBRATE: "Động vật có xương sống",
  NUTRIENT: "Dinh dưỡng",
  ABIOTIC: "Phi sinh học",
  COMPLEX: "Phức hợp",
  UNKNOWN: "Chưa rõ",
};

export const CROP_STAGE_LABELS: Record<TCropStage, string> = {
  SEEDLING: "Mạ",
  TILLERING: "Đẻ nhánh",
  BOOTING: "Làm đòng",
  HEADING: "Trổ bông",
  MILK: "Ngậm sữa",
  MATURITY: "Chín",
};

/** POST /diagnoses: 1..5 ảnh, note ≤ 1000 (api.md action 36). */
export const DIAGNOSIS_MAX_IMAGES = 5;
export const DIAGNOSIS_NOTE_MAX = 1000;
export const FEEDBACK_COMMENT_MAX = 1000;

/** Định dạng nhận ở input file — HEIC/HEIF được nén sang JPEG ở client nếu trình duyệt decode được. */
export const DIAGNOSIS_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

/** Nén trước khi gửi: cạnh dài ≤ 2048px, JPEG 0.85; > 5 MB thì nén lại 0.7. */
export const IMAGE_MAX_EDGE = 2048;
export const IMAGE_JPEG_QUALITY = 0.85;
export const IMAGE_JPEG_RETRY_QUALITY = 0.7;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Kiểm tra mờ: phương sai Laplacian trên ảnh thu nhỏ cạnh dài 512px; dưới ngưỡng = có thể mờ (chỉ cảnh báo). */
export const BLUR_SAMPLE_EDGE = 512;
export const BLUR_THRESHOLD = 100;

/** Dự phòng khi không nhận được realtime: poll 3s khi PROCESSING, ngừng sau 5 phút. */
export const POLL_INTERVAL_MS = 3_000;
export const POLL_TIMEOUT_MS = 5 * 60_000;

/** Tên event socket (api.md — Realtime). */
export const DIAGNOSIS_EVENTS = {
  completed: "diagnosis.completed",
} as const;

/** Mã lỗi domain của POST /diagnoses và feedback (api.md action 36, 39). */
export const DIAGNOSIS_ERROR_CODE = {
  invalidImage: "DIAGNOSIS_INVALID_IMAGE",
  cropNotSupported: "DIAGNOSIS_CROP_NOT_SUPPORTED",
  userNotAllowed: "DIAGNOSIS_USER_NOT_ALLOWED",
  dailyLimitExceeded: "DIAGNOSIS_DAILY_LIMIT_EXCEEDED",
  notFound: "DIAGNOSIS_NOT_FOUND",
  notCompleted: "DIAGNOSIS_NOT_COMPLETED",
} as const;
