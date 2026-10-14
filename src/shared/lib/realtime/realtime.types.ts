export type TRealtimeStatus = "connecting" | "connected" | "disconnected";

/** Lỗi server trả qua ack: `{ error: { code, message, details? } }` (api.md — Realtime). */
export type TRealtimeAckError = {
  error: { code: string; message: string; details?: Record<string, unknown> | string[] };
};

/** Chờ ack tối đa — quá hạn (mất kết nối) → AppError NETWORK_ERROR. */
export const REALTIME_ACK_TIMEOUT_MS = 10_000;
/** Handshake bị từ chối (ticket lỗi/hết hạn) → socket.io không tự nối lại; thử lại thủ công với độ trễ tăng dần. */
export const REALTIME_RETRY_DELAYS_MS = [1_000, 3_000, 10_000, 30_000] as const;
