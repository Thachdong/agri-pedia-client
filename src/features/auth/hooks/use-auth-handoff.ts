import { useMemo } from "react";
import type { TAuthHandoff, TAuthHandoffFlow } from "../types/auth.types";

const storageKey = (flow: TAuthHandoffFlow) => `agripedia.auth-handoff.${flow}`;

const isHandoff = (value: unknown): value is TAuthHandoff => {
  if (typeof value !== "object" || value === null) return false;
  const { loginType, identifier, at } = value as Record<string, unknown>;
  return (
    (loginType === "EMAIL" || loginType === "PHONE") &&
    typeof identifier === "string" &&
    identifier.length > 0 &&
    typeof at === "number" &&
    Number.isFinite(at)
  );
};

/** sessionStorage có thể bị chặn (private mode, cookie policy) → nuốt lỗi, coi như không có handoff. */
const getStorage = () => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

/**
 * Chuyển dữ liệu giữa các trang auth trong cùng tab (ui-ux.md: "handoff data vào session").
 * Chỉ gọi trong event handler / useEffect — không gọi lúc render (SSR không có sessionStorage).
 */
export function useAuthHandoff(flow: TAuthHandoffFlow) {
  return useMemo(() => {
    const key = storageKey(flow);
    return {
      save: (data: Omit<TAuthHandoff, "at">, at = Date.now()) => {
        try {
          getStorage()?.setItem(key, JSON.stringify({ ...data, at }));
        } catch {
          // Quota / storage bị chặn: trang sau tự fallback về trạng thái không có handoff.
        }
      },
      read: (): TAuthHandoff | null => {
        try {
          const raw = getStorage()?.getItem(key);
          const parsed: unknown = raw ? JSON.parse(raw) : null;
          return isHandoff(parsed) ? parsed : null;
        } catch {
          return null;
        }
      },
      clear: () => {
        try {
          getStorage()?.removeItem(key);
        } catch {
          // Không có gì để dọn.
        }
      },
    };
  }, [flow]);
}
