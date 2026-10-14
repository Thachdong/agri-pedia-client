import { useCallback, useEffect, useRef, useState } from "react";
import { queryKeys, useAppQuery, useAppQueryClient } from "@/shared/lib/query";
import { useRealtimeEvent } from "@/shared/lib/realtime";
import { DIAGNOSIS_EVENTS, POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from "../constants/diagnosis.constants";
import type { TDiagnosis, TDiagnosisCompletedEvent } from "../types/diagnosis.types";
import { diagnosisQuery } from "./diagnosis.queries";

const isProcessing = (diagnosis: TDiagnosis | undefined) => diagnosis?.status === "PROCESSING";

/**
 * Chi tiết chẩn đoán + chờ kết quả (cần nằm trong RealtimeProvider để nhận realtime):
 * - `diagnosis.completed` của đúng id → refetch chi tiết + lịch sử.
 * - Dự phòng: poll 3s khi PROCESSING; quá 5 phút kể từ lúc bắt đầu chờ → ngừng poll, `timedOut` = true.
 * - Socket nối LẠI → refetch (server không push lại event lúc offline).
 * `reload()` refetch và bắt đầu chờ lại từ đầu.
 */
export function useDiagnosisLive(id: string) {
  const client = useAppQueryClient();
  const [waitStartedAt, setWaitStartedAt] = useState(() => Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const hasConnected = useRef(false);

  const query = useAppQuery({
    ...diagnosisQuery(id),
    refetchInterval: ({ state }) => (isProcessing(state.data) && !timedOut ? POLL_INTERVAL_MS : false),
  });
  const processing = isProcessing(query.data);

  useEffect(() => {
    if (!processing) return;
    const timer = setTimeout(() => setTimedOut(true), Math.max(0, waitStartedAt + POLL_TIMEOUT_MS - Date.now()));
    return () => clearTimeout(timer);
  }, [processing, waitStartedAt]);

  const refresh = useCallback(
    () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.diagnoses.detail(id) }),
        client.invalidateQueries({ queryKey: queryKeys.diagnoses.lists() }),
      ]),
    [client, id],
  );

  useRealtimeEvent<TDiagnosisCompletedEvent>(DIAGNOSIS_EVENTS.completed, (event) => {
    if (event.id === id) void refresh();
  });

  useRealtimeEvent("connect", () => {
    if (hasConnected.current && processing) void refresh();
    hasConnected.current = true;
  });

  const reload = useCallback(() => {
    setWaitStartedAt(Date.now());
    setTimedOut(false);
    void refresh();
  }, [refresh]);

  return { ...query, timedOut: processing && timedOut, reload };
}
