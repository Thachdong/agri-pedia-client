// Public API của feature `product` (sản phẩm của distributor: list, chi tiết, tạo / sửa / xoá).
export { distributorProductsQuery, productDetailQuery } from "./hooks/product.queries";
export { useDistributorProducts } from "./hooks/use-distributor-products";
export { useProductDetail } from "./hooks/use-product-detail";
export type { TDistributorProduct, TProductDetail, TProductMedia, TProductStatus, TProductUnit } from "./types/product.types";
