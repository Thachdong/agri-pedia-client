"use client";

import { MessageCircleIcon, PencilIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import { ChatModal, type TChatTarget, useChatRooms } from "@/features/chat";
import { ReviewShopDialog } from "@/features/review";
import { EditProfileDialog, type TUserProfile, useMe } from "@/features/user";
import { Button } from "@/shared/components/atoms";
import { useDistributorProfile } from "../hooks/use-distributor-profile";

export type TDistributorProfileActionsProps = {
  distributorId: string;
};

/**
 * Nút cạnh tiêu đề profile (ui-ux.md §7) theo người xem — CHỈ render khi đã đăng nhập (gọi /users/me):
 * - chủ profile → "Chỉnh sửa" (M6)
 * - FARMER → "Chat" (M2) + "Đánh giá" (M4)
 * - DISTRIBUTOR khác → không có nút.
 * Chat cần nằm trong RealtimeProvider.
 */
export function DistributorProfileActions({ distributorId }: TDistributorProfileActionsProps) {
  const { data: me } = useMe();
  if (!me) return null;
  if (me.id === distributorId) return <OwnerActions />;
  if (me.role === "FARMER") return <FarmerActions distributorId={distributorId} me={me} />;
  return null;
}

function OwnerActions() {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setEditing(true)}>
        <PencilIcon aria-hidden />
        Chỉnh sửa
      </Button>
      <EditProfileDialog open={editing} onOpenChange={setEditing} />
    </>
  );
}

function FarmerActions({ distributorId, me }: { distributorId: string; me: TUserProfile }) {
  const { data: profile } = useDistributorProfile(distributorId);
  const { data: rooms } = useChatRooms();
  const [chatTarget, setChatTarget] = useState<TChatTarget | null>(null);
  const [reviewing, setReviewing] = useState(false);
  // Không có API "đã review chưa" — chỉ biết sau khi gửi (thành công hoặc 409) trong phiên đang xem.
  const [reviewed, setReviewed] = useState(false);
  const name = profile?.username ?? "";

  // Room đã có trong các trang đã tải → mở theo roomId; không thấy → receiverId (server tự tìm room theo cặp).
  const openChat = () => {
    const room = rooms?.rooms.find((item) => item.otherUserId === distributorId);
    setChatTarget(room ? { roomId: room.roomId } : { receiverId: distributorId });
  };

  return (
    <>
      <Button onClick={openChat}>
        <MessageCircleIcon aria-hidden />
        Chat
      </Button>
      <Button variant="highlight" onClick={() => setReviewing(true)} disabled={reviewed}>
        <StarIcon aria-hidden />
        {reviewed ? "Đã đánh giá" : "Đánh giá"}
      </Button>

      {chatTarget && (
        <ChatModal
          open
          onOpenChange={(next) => !next && setChatTarget(null)}
          target={chatTarget}
          otherUsername={name || null}
          currentUserId={me.id}
        />
      )}
      <ReviewShopDialog
        open={reviewing}
        onOpenChange={setReviewing}
        distributorId={distributorId}
        distributorName={name}
        onReviewed={() => setReviewed(true)}
      />
    </>
  );
}
