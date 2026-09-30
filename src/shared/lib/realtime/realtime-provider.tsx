"use client";

import type { Socket } from "socket.io-client";
import { createContext, use, useCallback, useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import { createRealtimeSocket, emitWithAck } from "./realtime-client";
import { REALTIME_RETRY_DELAYS_MS, type TRealtimeStatus } from "./realtime.types";

const RealtimeContext = createContext<Socket | null>(null);

/**
 * Một kết nối socket.io cho cả cây con — chỉ mount khi đã đăng nhập (unmount = ngắt kết nối, vd: logout).
 * Mất mạng: socket.io tự nối lại (mỗi lần xin ticket mới). Handshake bị từ chối: thử lại với độ trễ tăng dần.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [socket] = useState(createRealtimeSocket);

  useEffect(() => {
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onConnect = () => {
      attempt = 0;
    };
    const onConnectError = () => {
      if (socket.active) return; // lỗi mạng — socket.io tự nối lại
      const delay = REALTIME_RETRY_DELAYS_MS[Math.min(attempt, REALTIME_RETRY_DELAYS_MS.length - 1)];
      attempt += 1;
      timer = setTimeout(() => socket.connect(), delay);
    };
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.connect();
    return () => {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [socket]);

  return <RealtimeContext value={socket}>{children}</RealtimeContext>;
}

const subscribeStatus = (socket: Socket | null) => (onChange: () => void) => {
  if (!socket) return () => {};
  const events = ["connect", "disconnect", "connect_error"] as const;
  events.forEach((event) => socket.on(event, onChange));
  return () => events.forEach((event) => socket.off(event, onChange));
};

/**
 * Trạng thái + gửi event. Ngoài Provider (guest): status "disconnected", `emit` báo lỗi.
 */
export function useRealtime() {
  const socket = use(RealtimeContext);
  const subscribe = useCallback((onChange: () => void) => subscribeStatus(socket)(onChange), [socket]);
  const status = useSyncExternalStore<TRealtimeStatus>(
    subscribe,
    () => (socket?.connected ? "connected" : socket?.active ? "connecting" : "disconnected"),
    () => "disconnected",
  );
  const emit = useCallback(
    <TResponse, TPayload = unknown>(event: string, payload: TPayload) => {
      if (!socket) return Promise.reject(new Error("useRealtime().emit phải nằm trong <RealtimeProvider>"));
      return emitWithAck<TResponse, TPayload>(socket, event, payload);
    },
    [socket],
  );
  return { status, emit };
}

/** Lắng nghe một event server → client. Handler luôn là bản mới nhất, không cần memo. Ngoài Provider: không làm gì. */
export function useRealtimeEvent<TPayload>(event: string, handler: (payload: TPayload) => void) {
  const socket = use(RealtimeContext);
  const onEvent = useEffectEvent(handler);
  useEffect(() => {
    if (!socket) return;
    const listener = (payload: TPayload) => onEvent(payload);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [socket, event]);
}
