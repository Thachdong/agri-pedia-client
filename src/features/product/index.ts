// Public API của feature `product` (sản phẩm của distributor: list, chi tiết, tạo / sửa / xoá).
export { ProductCard, type TProductCardProps } from "./components/product-card";
export { ProductFormDialog, type TProductFormDialogProps } from "./components/product-form-dialog";
export { categoriesQuery, distributorProductsQuery, productDetailQuery } from "./hooks/product.queries";
export { useCategories } from "./hooks/use-categories";
export { useCreateProduct } from "./hooks/use-create-product";
export { useDeleteProduct } from "./hooks/use-delete-product";
export { useDistributorProducts } from "./hooks/use-distributor-products";
export { useProductDetail } from "./hooks/use-product-detail";
export { useUpdateProduct } from "./hooks/use-update-product";
export type {
  TCategory,
  TCreateProductInput,
  TDistributorProduct,
  TProductDetail,
  TProductMedia,
  TProductStatus,
  TProductUnit,
  TUpdateProductInput,
} from "./types/product.types";
