"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import {
  ChatModal,
  ChatRoomItem,
  formatReportMessage,
  type TChatRoom,
  type TChatTarget,
  useChatRooms,
  useSendMessage,
} from "@/features/chat";
import { type TDiagnosis, useCrops } from "@/features/diagnosis";
import type { TNearbyDistributor } from "@/features/distributor";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/atoms";
import { ConfirmDialog } from "@/shared/components/molecules";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { FindSupplierDialog } from "./find-supplier-dialog";

const SKELETON_ROWS = 3;

/** Người nhận đang chờ xác nhận: room đã có hoặc distributor mới (server tự tìm / tạo room theo cặp). */
type TRecipient = { target: TChatTarget; name: string };

export type TSendReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chẩn đoán COMPLETED của người đang đăng nhập (FARMER). */
  diagnosis: Pick<TDiagnosis, "id" | "cropType" | "createdAt">;
  currentUserId: string;
};

/**
 * Gửi report chẩn đoán (Specs/19102026/farmer.md): chọn cuộc trò chuyện với distributor, hoặc "Tìm nhà cung cấp"
 * → xác nhận → gửi tin DIAGNOSIS_REPORT → đóng dialog, mở Chat modal của room đó. Cần RealtimeProvider.
 */
export function SendReportDialog({ open, onOpenChange, diagnosis, currentUserId }: TSendReportDialogProps) {
  const rooms = useChatRooms();
  const crops = useCrops();
  const send = useSendMessage(currentUserId);
  const [findOpen, setFindOpen] = useState(false);
  const [recipient, setRecipient] = useState<TRecipient | null>(null);
  const [sendError, setSendError] = useState<string>();
  const [chat, setChat] = useState<{ roomId: string; name: string } | null>(null);

  const cropName = crops.data?.find((crop) => crop.code === diagnosis.cropType)?.nameVi ?? diagnosis.cropType;

  const choose = (next: TRecipient) => {
    setSendError(undefined);
    setRecipient(next);
  };

  const chooseRoom = (room: TChatRoom) =>
    choose({ target: { roomId: room.roomId }, name: room.otherUsername ?? "nhà cung cấp" });

  const chooseSupplier = (distributor: TNearbyDistributor) => {
    setFindOpen(false);
    choose({ target: { receiverId: distributor.userId }, name: distributor.username });
  };

  const confirmSend = async () => {
    if (!recipient) return;
    try {
      const ack = await send.mutateAsync({
        ...recipient.target,
        message: formatReportMessage(cropName, diagnosis.createdAt),
        type: "DIAGNOSIS_REPORT",
        diagnosisId: diagnosis.id,
      });
      setRecipient(null);
      onOpenChange(false);
      setChat({ roomId: ack.roomId, name: recipient.name });
      toast.success(`Đã gửi báo cáo cho ${recipient.name}`);
    } catch (error) {
      setSendError(isAppError(error) ? error.message : "Gửi báo cáo thất bại, vui lòng thử lại");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90dvh] flex-col gap-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gửi báo cáo chẩn đoán</DialogTitle>
            <DialogDescription>Chọn cuộc trò chuyện với nhà cung cấp để gửi báo cáo.</DialogDescription>
          </DialogHeader>

          <div className="scrollbar-thin -mx-2 min-h-0 flex-1 overflow-y-auto px-1">
            <RoomList rooms={rooms} currentUserId={currentUserId} onSelect={chooseRoom} />
          </div>

          <Button variant="outline" className="w-full" onClick={() => setFindOpen(true)}>
            <SearchIcon aria-hidden />
            Tìm nhà cung cấp
          </Button>
        </DialogContent>
      </Dialog>

      <FindSupplierDialog open={findOpen} onOpenChange={setFindOpen} onChoose={chooseSupplier} />

      <ConfirmDialog
        open={recipient !== null}
        onOpenChange={(next) => !next && setRecipient(null)}
        title="Gửi báo cáo chẩn đoán?"
        description={recipient && `Báo cáo chẩn đoán ${cropName} sẽ được gửi cho ${recipient.name} qua tin nhắn.`}
        confirmLabel="Gửi báo cáo"
        onConfirm={() => void confirmSend()}
        loading={send.isPending}
        error={sendError}
      />

      {chat && (
        <ChatModal
          open
          onOpenChange={(next) => !next && setChat(null)}
          target={{ roomId: chat.roomId }}
          otherUsername={chat.name}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}

type TRoomListProps = {
  rooms: ReturnType<typeof useChatRooms>;
  currentUserId: string;
  onSelect: (room: TChatRoom) => void;
};

function RoomList({ rooms, currentUserId, onSelect }: TRoomListProps) {
  const { data } = rooms;

  if (rooms.isPending) {
    return (
      <ul className="flex flex-col gap-1 p-1" aria-busy aria-label="Đang tải cuộc trò chuyện">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className="flex items-center gap-3 px-1 py-2">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!data) {
    return (
      <div role="alert" className="flex flex-col items-center gap-2 px-3 py-6 text-center text-sm text-muted-foreground">
        Không tải được danh sách tin nhắn.
        <Button variant="outline" size="sm" onClick={() => rooms.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (data.rooms.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-sm text-muted-foreground">
        Bạn chưa trò chuyện với nhà cung cấp nào. Hãy tìm nhà cung cấp để gửi báo cáo.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5" aria-label="Cuộc trò chuyện">
      {data.rooms.map((room) => (
        <li key={room.roomId}>
          <ChatRoomItem room={room} currentUserId={currentUserId} onSelect={onSelect} />
        </li>
      ))}
      {rooms.hasNextPage && (
        <li className="flex justify-center py-1">
          <Button variant="ghost" size="sm" loading={rooms.isFetchingNextPage} onClick={() => rooms.fetchNextPage()}>
            {rooms.isFetchNextPageError ? "Tải thêm thất bại — thử lại" : "Xem thêm"}
          </Button>
        </li>
      )}
    </ul>
  );
}
