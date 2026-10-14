import { io, type Socket } from "socket.io-client";
import { publicEnv } from "@/shared/config";
import { APP_ERROR_CODE, AppError, http, type TApiSchema } from "@/shared/lib/http";
import { REALTIME_ACK_TIMEOUT_MS, type TRealtimeAckError } from "./realtime.types";

type TRealtimeTicket = TApiSchema<"IssueRealtimeTicketResponse">;

/** Ticket ngắn hạn qua BFF (Bearer từ cookie httpOnly, tự refresh khi 401) — access token không tới browser. */
const fetchTicket = () => http.post<TRealtimeTicket>("/auth/realtime-ticket");

/**
 * Socket chưa kết nối (`autoConnect: false`) — Provider gọi `connect()`.
 * `auth` là hàm → chạy lại ở MỖI lần connect/reconnect nên luôn có ticket mới (ticket chỉ sống ~30s).
 * `websocket` only: gateway không cấu hình CORS, websocket không bị CORS chặn như long-polling.
 */
export function createRealtimeSocket(): Socket {
  return io(publicEnv.realtimeUrl, {
    autoConnect: false,
    transports: ["websocket"],
    auth: (callback) => {
      fetchTicket()
        .then(({ ticket }) => callback({ ticket }))
        // Không lấy được ticket → handshake không có ticket, server từ chối → Provider thử lại sau.
        .catch(() => callback({}));
    },
  });
}

const isAckError = (ack: unknown): ack is TRealtimeAckError =>
  typeof ack === "object" && ack !== null && "error" in ack && typeof (ack as TRealtimeAckError).error?.code === "string";

/** Gửi event và chờ ack; lỗi server / quá hạn → `AppError` như request HTTP. */
export async function emitWithAck<TResponse, TPayload = unknown>(
  socket: Socket,
  event: string,
  payload: TPayload,
): Promise<TResponse> {
  let ack: unknown;
  try {
    ack = await socket.timeout(REALTIME_ACK_TIMEOUT_MS).emitWithAck(event, payload);
  } catch {
    throw new AppError({
      status: 0,
      code: APP_ERROR_CODE.NETWORK_ERROR,
      message: "Mất kết nối realtime, vui lòng thử lại",
    });
  }
  if (isAckError(ack)) {
    const { code, message, details } = ack.error;
    throw new AppError({ status: 400, code, message, details });
  }
  return ack as TResponse;
}
