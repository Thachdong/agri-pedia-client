"use client";

import { useSession } from "../hooks/use-session";

export type TSessionHeaderActionsProps = {
  /** Nhóm nút khi đã đăng nhập (chẩn đoán, thông báo, chat, tài khoản...) — chỉ mount khi có phiên. */
  signedIn: React.ReactNode;
  /** Nhóm nút của guest (chẩn đoán → mời đăng nhập, Login / Register). */
  guest: React.ReactNode;
};

/**
 * Vùng phải của header cho trang public ISR: server không đọc cookie lúc render nên phiên đọc ở client
 * (`/api/auth/session`, không gọi NestJS). Đang tải → skeleton cùng chiều cao, gần cùng chiều rộng nhóm nút (tránh CLS).
 * Nhận slot thay vì tự import menu của feature khác (chat / notification đã phụ thuộc user / auth).
 */
export function SessionHeaderActions({ signedIn, guest }: TSessionHeaderActionsProps) {
  const session = useSession();

  if (session.isPending) {
    return (
      <div className="flex items-center gap-2" aria-busy aria-label="Đang tải tài khoản">
        <div className="h-8 w-9 animate-pulse rounded-md bg-muted sm:w-36" />
        <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  // Lỗi đọc phiên (mạng) → coi như guest: trang vẫn đọc được, đăng nhập lại nếu cần.
  return session.data?.signedIn ? signedIn : guest;
}
