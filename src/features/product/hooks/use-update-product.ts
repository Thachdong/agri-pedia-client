import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { updateProduct } from "../services/product.service";
import type { TUpdateProductInput } from "../types/product.types";

export type TUpdateProductVariables = { productId: string; input: TUpdateProductInput };

/**
 * Sửa product của shop người đang đăng nhập. Stale: chi tiết product + list của shop
 * (name / price / thumbnail đổi; đổi status khác ACTIVE → product biến khỏi list).
 * @param distributorId id của chính owner (me.id).
 */
export const useUpdateProduct = (distributorId: string) =>
  useAppMutation({
    mutationFn: ({ productId, input }: TUpdateProductVariables) => updateProduct(productId, input),
    invalidates: ({ productId }) => [queryKeys.products.detail(productId), queryKeys.products.list(distributorId)],
  });
