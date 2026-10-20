import { CHAT_REPORT_LABEL } from "../constants/chat.constants";

/** Giờ Việt Nam cố định — text được lưu vào tin nhắn, không phụ thuộc múi giờ máy gửi. */
const PARTS_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "20/10/2026 14:30" */
const formatReportTime = (iso: string) => {
  const part = Object.fromEntries(PARTS_FORMAT.formatToParts(new Date(iso)).map(({ type, value }) => [type, value]));
  return `${part.day}/${part.month}/${part.year} ${part.hour}:${part.minute}`;
};

/**
 * Text của tin DIAGNOSIS_REPORT (field `message` bắt buộc) — server không trả cây / thời gian kèm tin nên bong bóng và
 * preview hiện text này: "Báo cáo chẩn đoán · Lúa · 20/10/2026 14:30" (thời gian = lúc tạo chẩn đoán).
 */
export const formatReportMessage = (cropName: string, diagnosedAt: string) =>
  [CHAT_REPORT_LABEL, cropName, formatReportTime(diagnosedAt)].join(" · ");
