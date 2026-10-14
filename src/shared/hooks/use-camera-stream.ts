import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/** `unsupported`: trình duyệt không có getUserMedia hoặc trang không chạy HTTPS (localhost được phép). */
export type TCameraStatus = "starting" | "streaming" | "unsupported" | "denied" | "error";

const noopSubscribe = () => () => {};
const isCameraSupported = () => window.isSecureContext && typeof navigator.mediaDevices?.getUserMedia === "function";

const DENIED_ERRORS = new Set(["NotAllowedError", "SecurityError"]);

const stopStream = (stream: MediaStream | null) => stream?.getTracks().forEach((track) => track.stop());

/**
 * Mở camera ngay khi mount, tắt khi unmount — mount component dùng hook chỉ khi cần camera (vd. nội dung dialog).
 * Gắn `videoRef` vào `<video autoPlay playsInline muted>` luôn render. `capture()` chụp khung hình hiện tại thành JPEG.
 */
export function useCameraStream(constraints: MediaTrackConstraints = { facingMode: "environment" }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const supported = useSyncExternalStore(noopSubscribe, isCameraSupported, () => true);
  const [status, setStatus] = useState<Exclude<TCameraStatus, "unsupported">>("starting");
  const facingMode = constraints.facingMode;

  useEffect(() => {
    if (!isCameraSupported()) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode }, audio: false })
      .then((next) => {
        if (cancelled) return stopStream(next);
        stream = next;
        const video = videoRef.current;
        if (video) {
          video.srcObject = next;
          void video.play().catch(() => {});
        }
        setStatus("streaming");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus(error instanceof DOMException && DENIED_ERRORS.has(error.name) ? "denied" : "error");
      });
    const video = videoRef.current;
    return () => {
      cancelled = true;
      stopStream(stream);
      if (video) video.srcObject = null;
    };
  }, [facingMode]);

  /** Chụp khung hình hiện tại (độ phân giải gốc của camera). Chưa có hình → null. */
  const capture = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    return blob ? new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" }) : null;
  }, []);

  return { videoRef, status: supported ? status : ("unsupported" as const), capture };
}
