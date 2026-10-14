"use client";

import { useCallback, useEffect, useState } from "react";

const TICK_MS = 250;

const secondsLeft = (untilMs: number, nowMs: number) => Math.max(0, Math.ceil((untilMs - nowMs) / 1000));

/**
 * Đếm ngược tới một mốc thời gian tuyệt đối (epoch ms) — tính lại theo `Date.now()` mỗi tick
 * nên không trôi khi tab bị throttle. Ban đầu không chạy (an toàn khi SSR).
 */
export function useCountdown() {
  const [untilMs, setUntilMs] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const start = useCallback((until: number) => {
    const left = secondsLeft(until, Date.now());
    setUntilMs(left > 0 ? until : null);
    setRemainingSeconds(left);
  }, []);

  const stop = useCallback(() => {
    setUntilMs(null);
    setRemainingSeconds(0);
  }, []);

  useEffect(() => {
    if (untilMs === null) return;
    const id = window.setInterval(() => {
      const left = secondsLeft(untilMs, Date.now());
      setRemainingSeconds(left);
      if (left === 0) setUntilMs(null);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [untilMs]);

  return { remainingSeconds, isRunning: remainingSeconds > 0, start, stop };
}
