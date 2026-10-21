# product-creation-support — gợi ý tên, mô tả, danh mục, đơn vị sản phẩm từ ảnh nhãn (DISTRIBUTOR)

Feature: product (cập nhật) | Nơi dùng: dialog "Thêm sản phẩm" (M8) trên /profile/<id của mình>
Spec: Specs/19102026/distributor-flow.png — "Product Creation Support (6): Scan label and get information"
Wireframe: không có — gắn vào ProductFormDialog hiện có (ui-ux.md §7 M8)
API: POST /products/suggestions (multipart `image`, 1 ảnh jpg/png/webp ≤ 5 MB; chỉ DISTRIBUTOR ACTIVE)
- 200 { status: FOUND (suggestion { name, description, categoryId | null, unit | null }) | NOT_FOUND (detectedName) | UNREADABLE, remaining }
- 400 PRODUCT_SUGGESTION_INVALID_IMAGE, 403 PRODUCT_SELLER_NOT_ALLOWED, 413 (> 5 MB), 422 PRODUCT_SUGGESTION_QUOTA_EXCEEDED
- Quota trọn đời mỗi distributor (admin đặt). Không có API xem `remaining` trước — chỉ biết sau lần gọi đầu.
- Ảnh không được lưu.

## Steps
- [x] 1. [shared-unit]       chuyển nén ảnh (decode EXIF → vừa khung → JPEG, giảm chất lượng / thu nhỏ tới khi ≤ giới hạn) từ feature diagnosis sang src/shared/lib/image (browser-only nên không đặt ở shared/utils), nhận giới hạn làm tham số; diagnosis gọi bản shared
- [x] 2. [atomic-component]  molecule  AddImageTile         (move diagnosis → shared) — "Chụp ảnh" / "Chọn từ máy"; thêm prop accept, multiple
- [x] 3. [atomic-component]  organism  CameraCaptureDialog  (move diagnosis → shared) — thêm prop title, description (chẩn đoán giữ chữ cũ)
- [x] 4. [feature-api]       POST /products/suggestions → TProductSuggestion, suggestProduct (multipart), useSuggestProduct (không cache nào stale)
- [x] 5. [atomic-component]  organism  ProductLabelScanner  (new, product) — chụp (camera trong trang) / chọn ảnh nhãn → nén ≤ 5 MB → gửi; trạng thái: đang đọc / FOUND / NOT_FOUND / UNREADABLE / ảnh lỗi / hết lượt; "Còn N lượt"
- [x] 6. [atomic-component]  organism  ProductFormDialog    (update, product) — chỉ khi tạo mới: scanner ở đầu form; FOUND → điền tên + mô tả (ô đã có nội dung → ConfirmDialog trước khi ghi đè); NOT_FOUND → nút "Dùng tên này" (cùng quy tắc xác nhận)
- [x] 7. [arch-review]       — không có vi phạm
- [x] 8. [feature-api]       API cập nhật: suggestion thêm `categoryId` (id từ GET /categories) + `unit` (đều có thể null) — `npm run gen:api`
- [x] 9. [atomic-component]  organism  ProductFormDialog    (update) — FOUND điền thêm danh mục (chỉ khi id còn trong danh sách) + đơn vị; ghi đè danh mục / đơn vị đã chọn cũng hỏi trước
- [x] 10. [atomic-component] organism  ProductLabelScanner  (update) — thông báo FOUND hiện danh mục + đơn vị được gợi ý
- [x] 11. [atomic-component] organism  ProductLabelScanner  (update) — chỉ 1 ảnh: đã chọn / chụp ảnh → ẩn ô chụp / chọn, hiện ảnh + "Quét ảnh khác" (bỏ ảnh + kết quả, hiện lại ô)

## Components (in order)
  [atom]      Button, Input, Textarea            reuse  shared
  [molecule]  Callout, FormField, ConfirmDialog  reuse  shared
  [molecule]  AddImageTile                       move   diagnosis → shared
  [organism]  CameraCaptureDialog                move   diagnosis → shared
  [organism]  ProductLabelScanner                new    feature product
  [organism]  ProductFormDialog                  update feature product
  [page]      /profile/[id] (owner)              reuse  (không đổi)

## Decisions
- Ghi đè tên / mô tả / danh mục / đơn vị đã có giá trị khác → hỏi xác nhận trước. Gợi ý null → giữ nguyên ô đó.
- Không dùng ảnh nhãn làm ảnh sản phẩm.
- Chụp / chọn ảnh giống form chẩn đoán (camera trong trang + chọn từ máy). Chỉ 1 ảnh: có ảnh rồi thì ẩn ô chụp / chọn.

## Checklist kiểm tay
- [ ] DISTRIBUTOR → /profile/<id của mình> → "Thêm sản phẩm": khối "Điền nhanh từ ảnh nhãn" ở đầu form (sửa sản phẩm không có).
- [ ] Chụp ảnh (camera trong trang; chặn quyền camera → nút mở camera của máy) và "Chọn từ máy" đều quét được.
- [ ] Tìm thấy → điền tên + mô tả + danh mục + đơn vị (null thì giữ ô đó), thông báo hiện danh mục + đơn vị gợi ý; form đã có giá trị khác → hỏi "Thay nội dung đã nhập?" trước.
- [ ] Đọc được tên nhưng chưa có trong danh mục → "Dùng tên này" điền tên.
- [ ] Chọn / chụp xong → ô chụp / chọn ẩn, hiện ảnh + "Quét ảnh khác"; bấm → ô hiện lại (giá trị đã điền vào form giữ nguyên).
- [ ] Không đọc được → nhắc chụp lại; ảnh lỗi → báo lỗi; hết lượt → khoá ô chụp + báo hết lượt; "Còn N lượt" sau mỗi lần quét.
- [ ] Form chẩn đoán vẫn chụp / chọn / nén ảnh như trước (AddImageTile, CameraCaptureDialog, nén đã chuyển sang shared).
