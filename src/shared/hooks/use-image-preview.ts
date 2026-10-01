"use client";

import { useEffect, useState } from "react";

/**
 * Data URL để xem trước 1 file ảnh đã chọn (không phải ảnh → null). Đọc bất đồng bộ; kết quả gắn với đúng file đã đọc
 * nên đổi / bỏ file thì preview cũ tự mất, không cần reset state. Chỉ đọc lại khi đổi file (không theo object chứa nó).
 */
export function useImagePreview(file: File | null) {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  useEffect(() => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreview({ file, url: reader.result });
    };
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);
  return preview && preview.file === file ? preview.url : null;
}
