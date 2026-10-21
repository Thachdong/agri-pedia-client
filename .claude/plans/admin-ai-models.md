# admin-ai-models — ADMIN chọn AI model cho chẩn đoán bệnh + hỗ trợ tạo sản phẩm

Feature: admin-settings (đã có — thêm vào) | Pages: /admin/ai-provider → /admin/ai-provider/diagnosis, /admin/ai-provider/product-suggestion
Wireframe: specs/ui-ux/admin-page.png — mục (3) "AI Provider" (đang mock "Sắp ra mắt") thành thật
API:
- GET/PUT /admin/diagnosis/ai-models { describeModel (B1), verifyModel (B3) } — null = model env (`defaults`); 403 DIAGNOSIS_ADMIN_REQUIRED, 400 DIAGNOSIS_INVALID_SETTINGS (`details.field`)
- GET/PUT /admin/product-suggestion/ai-model { model } — null = model env (`defaults.model`); 403 PRODUCT_ADMIN_REQUIRED, 400 PRODUCT_SUGGESTION_INVALID_SETTINGS
- Model id: chữ, số, `.`, `_`, `-`, ≤ 100 ký tự, không bắt đầu bằng `.`/`_`/`-`. Server KHÔNG kiểm model có tồn tại ở provider → sai id = chẩn đoán / gợi ý lỗi. Không có API liệt kê model → nhập tay.

## Steps
- [x] 1. [feature-api]        `npm run gen:api` (openapi.d.ts chưa có schema AI model) + GET /admin/diagnosis/ai-models → TDiagnosisAiModels, adminDiagnosisAiModelsQuery; key adminSettings.diagnosisAiModels
- [x] 2. [feature-api]        PUT /admin/diagnosis/ai-models → useUpdateDiagnosisAiModels; invalidates adminSettings.diagnosisAiModels
- [ ] 3. [feature-api]        GET /admin/product-suggestion/ai-model → TProductSuggestionAiModel, productSuggestionAiModelQuery; key adminSettings.productSuggestionAiModel
- [ ] 4. [feature-api]        PUT /admin/product-suggestion/ai-model → useUpdateProductSuggestionAiModel; invalidates adminSettings.productSuggestionAiModel
- [ ] 5. [validation-schema]  diagnosisAiModelsSchema, productSuggestionAiModelSchema — rule model id chung (regex + ≤ 100), rỗng = null (dùng mặc định)
- [ ] 6. [atomic-component]   molecule  AiModelField                (new, feature) — label + input model id; badge "Mặc định" / "Tuỳ chỉnh"; mô tả "Để trống = <default env>"; nút "Dùng mặc định" xoá input
- [ ] 7. [atomic-component]   organism  DiagnosisAiModelsForm       (new, feature) — 2 AiModelField (B1 mô tả ảnh, B3 xác minh); callout cảnh báo sai id = chẩn đoán lỗi, chỉ áp cho ca mới; loading / lỗi tải + thử lại / lỗi server theo field; lưu
- [ ] 8. [atomic-component]   organism  ProductSuggestionAiModelForm (new, feature) — 1 AiModelField (đọc tên sản phẩm từ ảnh); cùng hành vi step 7
- [ ] 9. [page]               /admin/ai-provider (redirect) + /diagnosis + /product-suggestion; ROUTES.admin.aiProvider; sidebar nhóm "AI Provider" bỏ mock → 2 mục
- [ ] 10. [arch-review]

## Components (in order)
  [atom]      Button, Input, Badge                  reuse  shared
  [molecule]  FormField, Callout                    reuse  shared
  [molecule]  AiModelField                          new    feature admin-settings
  [organism]  DiagnosisAiModelsForm                 new    feature admin-settings
  [organism]  ProductSuggestionAiModelForm          new    feature admin-settings
  [organism]  SidebarNav                            reuse  shared
  [template]  AdminLayout                           reuse  shared
  [page]      /admin/ai-provider/diagnosis, /admin/ai-provider/product-suggestion  new

## Decisions
- Đặt trong feature `admin-settings` (cài đặt nền tảng ADMIN), không tạo feature mới.
- 2 trang con dưới nhóm sidebar "AI Provider" (giống nhóm "Cài đặt").
- Input text tự do, rỗng = null (model env); hiện model env hiện tại để admin biết đang chạy gì.
