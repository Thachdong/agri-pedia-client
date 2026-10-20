# product-creation-support — gợi ý tên + mô tả sản phẩm từ ảnh nhãn (DISTRIBUTOR)

Feature: product (cập nhật) | Nơi dùng: dialog "Thêm sản phẩm" (M8) trên /profile/<id của mình>
Spec: Specs/19102026/distributor-flow.png — "Product Creation Support (6): Scan label and get information"
Wireframe: không có — gắn vào ProductFormDialog hiện có (ui-ux.md §7 M8)
API: POST /products/suggestions (multipart `image`, 1 ảnh jpg/png/webp ≤ 5 MB; chỉ DISTRIBUTOR ACTIVE)
- 200 { status: FOUND (suggestion { name, description }) | NOT_FOUND (detectedName) | UNREADABLE, remaining }
- 400 PRODUCT_SUGGESTION_INVALID_IMAGE, 403 PRODUCT_SELLER_NOT_ALLOWED, 413 (> 5 MB), 422 PRODUCT_SUGGESTION_QUOTA_EXCEEDED
- Quota trọn đời mỗi distributor (admin đặt). Không có API xem `remaining` trước — chỉ biết sau lần gọi đầu.
- Ảnh không được lưu.

## Steps
- [x] 1. [shared-unit]       chuyển nén ảnh (decode EXIF → vừa khung → JPEG, giảm chất lượng / thu nhỏ tới khi ≤ giới hạn) từ feature diagnosis sang src/shared/lib/image (browser-only nên không đặt ở shared/utils), nhận giới hạn làm tham số; diagnosis gọi bản shared
- [x] 2. [atomic-component]  molecule  AddImageTile         (move diagnosis → shared) — "Chụp ảnh" / "Chọn từ máy"; thêm prop accept, multiple
- [x] 3. [atomic-component]  organism  CameraCaptureDialog  (move diagnosis → shared) — thêm prop title, description (chẩn đoán giữ chữ cũ)
- [ ] 4. [feature-api]       POST /products/suggestions → TProductSuggestion, suggestProduct (multipart), useSuggestProduct (không cache nào stale)
- [ ] 5. [atomic-component]  organism  ProductLabelScanner  (new, product) — chụp (camera trong trang) / chọn ảnh nhãn → nén ≤ 5 MB → gửi; trạng thái: đang đọc / FOUND / NOT_FOUND / UNREADABLE / ảnh lỗi / hết lượt; "Còn N lượt"
- [ ] 6. [atomic-component]  organism  ProductFormDialog    (update, product) — chỉ khi tạo mới: scanner ở đầu form; FOUND → điền tên + mô tả (ô đã có nội dung → ConfirmDialog trước khi ghi đè); NOT_FOUND → nút "Dùng tên này" (cùng quy tắc xác nhận)
- [ ] 7. [arch-review]

## Components (in order)
  [atom]      Button, Input, Textarea            reuse  shared
  [molecule]  Callout, FormField, ConfirmDialog  reuse  shared
  [molecule]  AddImageTile                       move   diagnosis → shared
  [organism]  CameraCaptureDialog                move   diagnosis → shared
  [organism]  ProductLabelScanner                new    feature product
  [organism]  ProductFormDialog                  update feature product
  [page]      /profile/[id] (owner)              reuse  (không đổi)

## Decisions
- Ghi đè tên / mô tả đã có nội dung → hỏi xác nhận trước.
- Không dùng ảnh nhãn làm ảnh sản phẩm.
- Chụp / chọn ảnh giống form chẩn đoán (camera trong trang + chọn từ máy).
