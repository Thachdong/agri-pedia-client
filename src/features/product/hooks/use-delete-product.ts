import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { deleteProduct } from "../services/product.service";

/**
 * Xoá product của shop người đang đăng nhập. List của shop stale; cache chi tiết bị bỏ hẳn
 * (refetch sẽ 404). Review của product đã xoá vẫn nằm trong GET /reviews → không động tới reviews.
 * @param distributorId id của chính owner (me.id).
 */
export const useDeleteProduct = (distributorId: string) =>
  useAppMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    invalidates: () => [queryKeys.products.list(distributorId)],
    onSuccess: (_data, productId, _onMutateResult, { client }) => {
      client.removeQueries({ queryKey: queryKeys.products.detail(productId) });
    },
  });
