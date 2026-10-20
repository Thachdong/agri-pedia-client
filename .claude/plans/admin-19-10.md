# admin-19-10 — gap ADMIN theo Specs/19102026/admin.md

Feature: admin-settings (mới) + cập nhật auth, distributor, article-admin, các route front
Pages: /benh-cay-trong/*, /profile/[id], /diagnosis, /diagnosis/[id] (ADMIN vào được),
       /admin/articles (thống kê), /admin/settings/diagnosis, /admin/settings/top-articles (mới)
Spec: Specs/19102026/admin.md, admin-flow.png | Wireframe: specs/ui-ux/admin-page.png (khung admin + sidebar)
Bỏ qua: setting header (menu, banner), AI provider.
API:
- GET/PUT /admin/diagnosis/settings { dailyFreeLimit, defaultCropType, maxImages, maxImageBytes, maxImageWidth, maxImageHeight }
- GET/PUT /admin/knowledge/settings { limit }
- GET/PUT /admin/knowledge/crops/{cropSlug}/top-articles { articleSlugs[] }
- GET /admin/knowledge/crops (thống kê — đã có), GET /admin/knowledge/crops/{cropSlug}/articles (bài để chọn — đã có)
- GET /distributors/nearby (map admin — đã có)
Server: ADMIN tạo chẩn đoán được (create-diagnosis chỉ kiểm user ACTIVE).

## Steps
### A. ADMIN vào trang front (T1–T5)
- [x] 1. [bff-auth]           proxy: ADMIN vào được mọi trang front trừ /profile/me (thay allowlist chỉ có "/"); /api/auth/session trả thêm `isAdmin` (từ cookie role) cho header trang ISR. Chỉ đổi nhánh ADMIN — guest / FARMER / DISTRIBUTOR giữ nguyên (kiểm bằng bảng path × role trước / sau)
- [x] 2. [feature-api]        auth: TSession thêm `isAdmin`
- [x] 3. [atomic-component]   organism  SessionHeaderActions  (update, auth) — thêm slot `admin`
- [x] 4. [page]               header ADMIN (chỉ AdminUserMenu có link trang quản trị, không chat / notification / nút chẩn đoán): /benh-cay-trong layout, /profile/[id], /diagnosis, /diagnosis/[id]
### B. Map ADMIN hiện toàn bộ (T26)
- [x] 5. [atomic-component]   organism  DistributorExplorer   (update, distributor) — origin `all` tự tải hết các trang để map đủ marker
### C. Thống kê article (T25)
- [x] 6. [atomic-component]   organism  ArticleCropStats      (new, article-admin) — mỗi cây: số bệnh, có bài, đã publish, còn thiếu; click → chọn cây; gắn qua slot `summary` mới của ArticleTargetTable (giữa tiêu đề và bảng)
### D. /admin/settings (T18–T21)
- [x] 7. [feature-scaffold]   feature `admin-settings` — components, hooks, services, schemas, types
- [x] 8. [feature-api]        GET /admin/diagnosis/settings → adminDiagnosisSettingsQuery; key adminSettings.diagnosis
- [x] 9. [feature-api]        PUT /admin/diagnosis/settings → useUpdateDiagnosisSettings; invalidates adminSettings.diagnosis + diagnoses.settings
- [x] 10. [feature-api]       GET /admin/knowledge/settings → topArticleSettingsQuery; key adminSettings.topArticleLimit
- [ ] 11. [feature-api]       PUT /admin/knowledge/settings → useUpdateTopArticleLimit; invalidates topArticleLimit + topArticles
- [ ] 12. [feature-api]       GET /admin/knowledge/crops/{cropSlug}/top-articles → cropTopArticlesQuery; key adminSettings.topArticles(cropSlug)
- [ ] 13. [feature-api]       PUT /admin/knowledge/crops/{cropSlug}/top-articles → useSetCropTopArticles; invalidates topArticles(cropSlug)
- [ ] 14. [validation-schema] diagnosisSettingsSchema — số nguyên, khớp DIAGNOSIS_SETTINGS_BOUNDS của server: dailyFreeLimit 1..1000, maxImages 1..10, maxImageBytes 100 KB..20 MB, maxImageWidth / maxImageHeight 256..8192 (độc lập, không ràng buộc chéo), defaultCropType null hoặc cây bật chẩn đoán; topArticleLimitSchema 1..50
- [ ] 15. [atomic-component]  organism  DiagnosisSettingsForm  (new) — free request/ngày, cây mặc định, số ảnh tối đa, dung lượng (MB), kích thước (px)
- [ ] 16. [atomic-component]  organism  TopArticleLimitForm    (new) — số bài nổi bật mỗi cây
- [ ] 17. [atomic-component]  organism  TopArticlesEditor      (new) — chọn cây; danh sách có thứ tự (lên / xuống / bỏ); thêm từ bài đã publish của cây; tối đa `limit`; lưu
- [ ] 18. [page]              /admin/settings → /admin/settings/diagnosis; /admin/settings/top-articles; ROUTES.admin.settings; sidebar nhóm "Cài đặt"
### E. Kết thúc
- [ ] 19. [arch-review]       + checklist kiểm luồng ADMIN (T28)

## Components (in order)
  [atom]      Button, Input, Select, Badge     reuse  shared
  [molecule]  FormField, Callout, ConfirmDialog reuse shared
  [organism]  SessionHeaderActions   update feature auth
  [organism]  AdminUserMenu          reuse  feature user
  [organism]  DistributorExplorer    update feature distributor
  [organism]  ArticleCropStats       new    feature article-admin
  [organism]  DiagnosisSettingsForm  new    feature admin-settings
  [organism]  TopArticleLimitForm    new    feature admin-settings
  [organism]  TopArticlesEditor      new    feature admin-settings
  [template]  AdminLayout, ContentLayout, ProfileLayout  reuse shared
  [page]      /admin/settings/diagnosis, /admin/settings/top-articles  new
  [page]      /benh-cay-trong layout, /profile/[id], /diagnosis, /diagnosis/[id], /admin/articles  update

## Decisions
- Proxy chuyển từ allowlist sang blocklist cho ADMIN: chặn /profile/me, còn lại vào được. Không đổi logic guest / FARMER / DISTRIBUTOR.
- Header ADMIN ở trang front = chỉ AdminUserMenu (email/phone, trang quản trị, đăng xuất) — không nút "Chẩn đoán".
- Settings tách 2 trang con: /admin/settings/diagnosis, /admin/settings/top-articles.
- Dung lượng ảnh nhập theo MB (API nhận bytes); ràng buộc giống server (xem step 14).

## Thêm (đã duyệt) — form chẩn đoán đang hardcode giới hạn ảnh; làm sau step 14
- [ ] 14a. [shared-unit]       compressImage nhận giới hạn từ GET /diagnoses/settings (cạnh ≤ min(2048, maxImageWidth/Height), ≤ maxImageBytes) thay hằng số 2048px / 5 MB
- [ ] 14b. [atomic-component]  organism DiagnosisForm (update) — số ảnh tối đa + schema theo settings.maxImages thay DIAGNOSIS_MAX_IMAGES = 5
