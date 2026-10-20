import { useAppQuery } from "@/shared/lib/query";
import { messageDiagnosisQuery } from "./chat.queries";

/** `messageId` null = dialog report đang đóng → không gọi API. */
export const useMessageDiagnosis = (roomId: string, messageId: string | null) =>
  useAppQuery({ ...messageDiagnosisQuery(roomId, messageId ?? ""), enabled: messageId !== null });
