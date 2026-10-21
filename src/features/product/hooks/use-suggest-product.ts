import { useAppMutation } from "@/shared/lib/query";
import { suggestProduct } from "../services/product.service";

/** Gợi ý từ ảnh nhãn — không ghi dữ liệu nào đang cache (chỉ trừ lượt gợi ý phía server). */
export const useSuggestProduct = () =>
  useAppMutation({
    // Lỗi hiện ngay trong khối quét nhãn.
    meta: { silent: true },
    mutationFn: (image: Blob) => suggestProduct(image),
    invalidates: false,
  });
