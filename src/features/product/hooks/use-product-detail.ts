import { useAppQuery } from "@/shared/lib/query";
import { productDetailQuery } from "./product.queries";

/** Lỗi (404 product đã xoá...) hiển thị ngay trong dialog chi tiết → không bật thông báo global. */
export const useProductDetail = (productId: string) =>
  useAppQuery({ ...productDetailQuery(productId), meta: { silent: true } });
