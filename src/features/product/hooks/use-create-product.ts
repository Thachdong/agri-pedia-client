import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { createProduct } from "../services/product.service";
import type { TCreateProductInput } from "../types/product.types";

/**
 * Tạo product cho shop của người đang đăng nhập — product mới (ACTIVE) xuất hiện ở đầu list của shop.
 * @param distributorId id của chính owner (me.id).
 */
export const useCreateProduct = (distributorId: string) =>
  useAppMutation({
    mutationFn: (input: TCreateProductInput) => createProduct(input),
    invalidates: () => [queryKeys.products.list(distributorId)],
  });
