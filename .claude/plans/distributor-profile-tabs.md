Feature: distributor-profile-tabs | Page: /profile/[id] (tiếp nối distributor-profile)
Wireframe: specs/ui-ux/image-5.png (tab Sản phẩm), image-6.png (tab Đánh giá) — ui-ux.md §7 (M3, M5, M8, M9)
API: GET /products?distributorId (public, cursor), GET /products/:id (public), GET /categories,
     POST /products, PATCH /products/:id, DELETE /products/:id,
     GET /reviews?distributorId (public, cursor, summary cả shop), GET /reviews/products/:id (public, cursor),
     GET /reviews/summary?targetType&targetId (public), POST /reviews (đã có useCreateReview)
Decisions:
  - openapi.d.ts chưa có schema mới → step 2 chạy `npm run gen:api`.
    ProductMediaResponse.type sinh ra `{}` (spec thiếu enum) → override type = TMediaType trong types của feature.
  - Card (list): thumbnail, name, price / unit, quantity. List KHÔNG trả category / description → card không hiện 2 field này
    (wireframe có). Đầy đủ trong dialog chi tiết.
  - M3 (dialog chi tiết): GET /products/:id → gallery media, name, description, price / unit, quantity, category (categoryId → tên qua
    GET /categories), status (badge, chỉ owner thấy khác ACTIVE); rating GET /reviews/summary PRODUCT; list GET /reviews/products/:id (infinite).
    404 PRODUCT_NOT_FOUND (đã xoá) → thông báo trong dialog.
  - "Đánh giá của bạn" = review.user.id === me.id trong các trang đã tải (không có API "review của tôi").
    Dialog product: farmer chưa thấy review của mình → ReviewForm (PRODUCT) inline; 409 REVIEW_ALREADY_EXISTS → khoá form + thông báo.
    Đã review → chỉ highlight (không sửa — PATCH /reviews ngoài scope).
  - Tab Đánh giá: summary từ GET /reviews (cả shop) + list shop & product (tag productName), infinite scroll, highlight của farmer.
  - Owner: "Thêm sản phẩm" (M8). Dialog chi tiết owner: "Sửa" (M9, prefill từ detail, đổi status, thêm media + xoá media cũ theo id)
    + "Xoá" (confirm). List chỉ trả ACTIVE → product đổi sang INACTIVE / OUT_OF_STOCK biến khỏi tab (kể cả owner).
  - ProductDetailDialog (feature product) nhận slot `reviews` + `actions` → product không phụ thuộc review; ghép ở feature distributor.
  - Invalidate: create → products.list(distributorId); update → products.list + products.detail(id);
    delete → products.list + bỏ cache products.detail(id); create review → reviews.all (đã có, phủ cả product reviews + summary).
  - Page prefetch trang đầu products + reviews shop (public) cho mọi viewer.

- [x] 1. [feature-scaffold]     feature `product` — layers: components, hooks, services, schemas, types, constants
- [x] 2. [feature-api]          `npm run gen:api` + GET /products → TDistributorProduct, distributorProductsQuery (infinite), useDistributorProducts; keys products.list(distributorId)
- [x] 3. [feature-api]          GET /products/:id → TProductDetail, productDetailQuery, useProductDetail; keys products.detail(id)
- [x] 4. [feature-api]          GET /categories → TCategory, categoriesQuery, useCategories; keys products.categories (staleTime dài)
- [x] 5. [feature-api]          POST /products → TCreateProductInput, useCreateProduct; invalidates products.list(distributorId)
- [x] 6. [feature-api]          PATCH /products/:id → TUpdateProductInput, useUpdateProduct; invalidates products.list + products.detail(id)
- [x] 7. [feature-api]          DELETE /products/:id → useDeleteProduct; invalidates products.list, removeQueries products.detail(id) (review của product đã xoá vẫn hiện → reviews không stale)
- [x] 8. [feature-api]          GET /reviews → TDistributorReview, TReviewSummary, distributorReviewsQuery (infinite), useDistributorReviews; keys reviews.list(params)
- [x] 9. [feature-api]          GET /reviews/products/:id → TProductReview, productReviewsQuery (infinite), useProductReviews; keys reviews.product(productId)
- [x] 10. [feature-api]         GET /reviews/summary → TReviewSummaryResponse (select → TReviewSummary chung shape với GET /reviews), reviewSummaryQuery, useReviewSummary; keys reviews.summary(targetType, targetId)
- [x] 11. [validation-schema]   productSchema create / update (feature product) — mirror CreateProductDto / UpdateProductDto, media 1..10 (create)
- [x] 12. [shared-unit]         hook useInfiniteSentinel (shared) — ref sentinel + IntersectionObserver → fetchNextPage
- [x] 13. [shared-unit]         util formatPrice (shared, VND) + PRODUCT_UNIT_LABELS / PRODUCT_STATUS_LABELS (feature product constants)
- [x] 14. [atomic-component]    atom      StarRating             (new, shared) — hiển thị sao readonly (giá trị lẻ), aria-label
- [ ] 15. [atomic-component]    molecule  ConfirmDialog          (new, shared) — tiêu đề, mô tả, nút xác nhận destructive + loading
- [ ] 16. [atomic-component]    molecule  MultiImageInput        (new, shared) — ảnh hiện có (xoá được) + chọn thêm ảnh mới, preview lưới, giới hạn số lượng
- [ ] 17. [atomic-component]    molecule  MediaGallery           (new, shared) — ảnh lớn + thumbnails, video / file fallback
- [ ] 18. [atomic-component]    molecule  ProductCard            (new, feature product) — thumbnail, name, price / unit, quantity; clickable
- [ ] 19. [atomic-component]    molecule  ReviewItem             (new, feature review) — avatar, username, sao, nội dung, tag product (tuỳ), thời gian tương đối; highlight "Đánh giá của bạn"
- [ ] 20. [atomic-component]    molecule  RatingSummary          (new, feature review) — điểm TB / tổng, 5 hàng đếm + thanh (TReviewSummary — 1 shape)
- [ ] 21. [atomic-component]    organism  ReviewForm             (new, feature review) — form inline sao + nội dung cho target bất kỳ, xử lý 409 / 403; ReviewShopDialog dùng lại
- [ ] 22. [atomic-component]    organism  ProductReviewsPanel    (new, feature review) — summary PRODUCT + list review product (infinite), highlight của farmer, chưa có → ReviewForm
- [ ] 23. [atomic-component]    organism  ShopReviewsPanel       (new, feature review) — RatingSummary shop + list review shop & product (infinite), highlight của farmer
- [ ] 24. [atomic-component]    organism  ProductFormDialog      (new, feature product) — M8 / M9: form + MultiImageInput + Select category / unit / status, upload → POST / PATCH
- [ ] 25. [atomic-component]    organism  ProductDetailDialog    (new, feature product) — M3: useProductDetail + MediaGallery + thông tin + slot reviews + slot actions; loading / 404
- [ ] 26. [atomic-component]    organism  DistributorProductsTab (new, feature distributor) — grid infinite ProductCard, owner "Thêm sản phẩm"; mở ProductDetailDialog (+ ProductReviewsPanel, owner Sửa / Xoá)
- [ ] 27. [atomic-component]    organism  DistributorProfileTabs (new, feature distributor) — Tabs Sản phẩm | Đánh giá (default Sản phẩm) → DistributorProductsTab | ShopReviewsPanel
- [ ] 28. [page]                /profile/[id] — gắn tabs vào ProfileLayout, prefetch trang đầu products + reviews shop
- [ ] 29. [arch-review]

Components (in order):
  [atom]      StarRating              new    shared
  [atom]      Avatar, Button, Dialog, Tabs, Select, Input, Textarea, StarRatingInput  reuse  shared
  [molecule]  ConfirmDialog           new    shared
  [molecule]  MultiImageInput         new    shared
  [molecule]  MediaGallery            new    shared
  [molecule]  FormField               reuse  shared
  [molecule]  ProductCard             new    feature product
  [molecule]  ReviewItem              new    feature review
  [molecule]  RatingSummary           new    feature review
  [organism]  ReviewForm              new    feature review
  [organism]  ProductReviewsPanel     new    feature review
  [organism]  ShopReviewsPanel        new    feature review
  [organism]  ProductFormDialog       new    feature product
  [organism]  ProductDetailDialog     new    feature product
  [organism]  DistributorProductsTab  new    feature distributor
  [organism]  DistributorProfileTabs  new    feature distributor
  [organism]  DistributorProfileInfo, DistributorProfileActions, ReviewShopDialog  reuse
  [template]  ProfileLayout           reuse  shared (slot tabs đã có)
  [page]      ProfilePage             update app/profile/[id]

Resolved (openapi mới):
  - Product detail có (GET /products/:id) → prefill edit đầy đủ, xoá media theo id.
  - Review theo product có (GET /reviews/products/:id) + rating (GET /reviews/summary) → bỏ lọc client.
Open questions:
  1. Card list thiếu category / description (wireframe có) — chấp nhận, hay xin backend thêm vào DistributorProductResponse?
