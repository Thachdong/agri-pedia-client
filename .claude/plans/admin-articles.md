# Plan — admin-articles

Feature: article-admin | Pages: /admin → /admin/articles, /admin/articles/new, /admin/articles/[code], /admin/articles/[code]/edit (ADMIN only, dynamic)
Wireframe: specs/ui-ux/admin-page.png
API: GET /admin/knowledge/crops, GET /admin/knowledge/crops/{cropSlug}/articles, GET /admin/knowledge/articles/{code},
     POST /admin/knowledge/articles, PUT /admin/knowledge/articles/{code}, POST /admin/knowledge/articles/{code}/{unpublish|publish},
     POST /media/presign-url (reuse)

- [x] 1. [data-wrapper]       `npm run gen:api` — openapi.d.ts chưa có Admin* schema + `origin` của ArticleDetailResponse
- [x] 2. [bff-auth]           ROUTES.admin.*; BFF login set cookie httpOnly `ap_role` (refresh giữ, logout xoá); getPostLoginPath: ADMIN → /admin/articles;
                               proxy: chưa login + /admin → /login; role ADMIN + front page (ngoài /admin, /api) → /admin/articles; role ≠ ADMIN + /admin → home.
                               Cookie role chỉ để điều hướng — quyền thật vẫn check ở layout /admin (meQuery) + NestJS 403
- [x] 3. [feature-scaffold]   feature `article-admin` — layers: types, constants, services, hooks, schemas, utils, components
- [x] 4. [feature-api]        GET /admin/knowledge/crops → TAdminArticleCrop, listAdminArticleCrops, useAdminArticleCrops; key adminArticles.crops
- [ ] 5. [feature-api]        GET /admin/knowledge/crops/{cropSlug}/articles → TAdminArticleTarget, useAdminArticleTargets; key adminArticles.targets(crop)
- [ ] 6. [feature-api]        GET /admin/knowledge/articles/{code} → TAdminArticleDetail, useAdminArticle; key adminArticles.detail(code)
- [ ] 7. [feature-api]        POST /admin/knowledge/articles → useCreateArticle; invalidates adminArticles.crops + targets(crop)
- [ ] 8. [feature-api]        PUT /admin/knowledge/articles/{code} → useUpdateArticle; invalidates detail(code) + targets(crop)
- [ ] 9. [feature-api]        POST …/{code}/unpublish + …/publish → useSetArticlePublished; invalidates detail(code) + targets + crops
- [ ] 10. [validation-schema] articleFormSchema (create: + code, slug) — title 1-70, summary 50-160, slug SLUG, image file `^[a-z0-9-]+\.webp$` unique, cover ∈ images, credit required, sources
- [ ] 11. [shared-unit]       utils article-form: detail → form values, form → Create/Update DTO, preview markdown (file name → images[].url), slug từ tên bệnh (tái dùng de-accent của heading-ids)
- [ ] 12. [shared-unit]       constant ARTICLE_ORIGIN_LABELS (feature article): AI → "Nội dung được tạo bởi AI"; ADMIN | AI_REVIEWED → "Nội dung được kiểm duyệt bởi Admin"
- [ ] 13. [atomic-component]  atom      Table             (new, shared — shadcn table)
- [ ] 14. [atomic-component]  molecule  ArticleOriginBadge (new, feature article — dùng ở public ArticleMeta + bảng admin)
- [ ] 15. [atomic-component]  molecule  ArticleMeta       (update, feature article — thay dòng reviewedBy bằng ArticleOriginBadge)
- [ ] 16. [atomic-component]  organism  SidebarNav        (new, shared — nhóm thu gọn/mở rộng, item active/disabled, Collapsible của radix)
- [ ] 17. [atomic-component]  template  AdminLayout       (new, shared — header logo + user icon, sidebar, content cuộn, khung 100dvh; mobile: sidebar thành drawer)
- [ ] 18. [atomic-component]  molecule  AdminUserMenu     (new, feature user — dropdown: email/phone + Đăng xuất)
- [ ] 19. [atomic-component]  molecule  AdminCropSelect   (new, feature — chọn cây, kèm articleCount/targetCount)
- [ ] 20. [atomic-component]  molecule  ArticleRowActions (new, feature — chưa có bài: Create; có bài: View / Update / Unpublish|Publish + ConfirmDialog)
- [ ] 21. [atomic-component]  organism  ArticleTargetTable (new, feature — cột: Tên bệnh (variant thụt lề) · Kiểm duyệt · Cập nhật lần cuối · Actions; filter "Chưa có bài"; loading/empty/error)
- [ ] 22. [atomic-component]  organism  ArticleImagesField (new, feature — upload qua useMediaUploads, file name, alt, caption, credit, chọn cover)
- [ ] 23. [atomic-component]  organism  ArticleSourcesField (new, feature — useFieldArray title + url)
- [ ] 24. [atomic-component]  organism  ArticleMarkdownEditor (new, feature — textarea + tab Xem trước, tái dùng ArticleMarkdown)
- [ ] 25. [atomic-component]  organism  ArticleForm       (new, feature — mode create|update, map lỗi KNOWLEDGE_ARTICLE_INVALID_CONTENT `details.issues` vào field)
- [ ] 26. [atomic-component]  organism  AdminArticlePreview (new, feature — meta + origin + trạng thái publish + ArticleMarkdown; xem được cả bài unpublished)
- [ ] 26b. [atomic-component] molecule ArticleTargetPicker (new, feature — chọn cây + bệnh chưa có bài; dùng khi vào Create từ sidebar, không có `code`)
- [ ] 27. [page]              layout /admin — guard server (meQuery, role ≠ ADMIN → redirect home), AdminLayout + SidebarNav (Article: List/Create — không có Update; AI Provider: mock); /admin → redirect /admin/articles
- [ ] 28. [page]              /admin/articles?crop=<slug> — prefetch crops + targets, ArticleTargetTable
- [ ] 29. [page]              /admin/articles/new[?code=<CODE>&crop=<slug>] — có code: ArticleForm create (slug gợi ý từ tên bệnh); không có: ArticleTargetPicker trước
- [ ] 30. [page]              /admin/articles/[code]/edit — prefetch detail, ArticleForm update
- [ ] 31. [page]              /admin/articles/[code] — prefetch detail, AdminArticlePreview + link public (nếu published)
- [ ] 32. [arch-review]

Components (in order):
  [atom]      Table                 new     shared
  [atom]      Button / Badge        reuse   shared
  [molecule]  ConfirmDialog         reuse   shared
  [molecule]  FormField             reuse   shared
  [molecule]  ArticleOriginBadge    new     feature (article)
  [molecule]  ArticleMeta           update  feature (article)
  [organism]  SidebarNav            new     shared
  [template]  AdminLayout           new     shared
  [molecule]  AdminUserMenu         new     feature (user)
  [molecule]  AdminCropSelect       new     feature
  [molecule]  ArticleRowActions     new     feature
  [organism]  ArticleTargetTable    new     feature
  [organism]  ArticleImagesField    new     feature
  [organism]  ArticleSourcesField   new     feature
  [organism]  ArticleMarkdown       reuse   feature (article)
  [organism]  ArticleMarkdownEditor new     feature
  [organism]  ArticleForm           new     feature
  [organism]  AdminArticlePreview   new     feature
  [molecule]  ArticleTargetPicker   new     feature
  [page]      AdminArticlesPage / AdminArticleCreatePage / AdminArticleEditPage / AdminArticleViewPage

Notes:
- Seed AI lúc deploy là việc của server; client chỉ đọc `origin`. "Kiểm duyệt": origin AI → tạo bởi AI; ADMIN/AI_REVIEWED → kiểm duyệt bởi Admin (server tự chuyển AI → AI_REVIEWED khi PUT).
- Bảng theo từng cây (API list targets theo cropSlug) — `targetCount - articleCount` = số bệnh chưa có bài.
- Variant chỉ tạo được khi bệnh chính đã có bài → nút Create của variant disabled + tooltip.

Decisions (đã chốt):
1. Editor: textarea markdown + tab xem trước, không lib WYSIWYG.
2. Bài unpublished: nút thứ 3 = "Publish".
3. View: preview trong admin + link public (nếu published).
4. Sidebar không có item Update (vào edit từ bảng).
5. ArticleMeta public dùng badge theo origin.
6. Feature riêng `article-admin`. Admin seed từ API, không đổi UI đăng ký. ADMIN login → thẳng /admin; ADMIN không vào được front pages.
- Phiên cũ (login trước khi có cookie `ap_role`) chưa bị chặn front pages cho tới lần login sau — /admin vẫn guard bằng meQuery.
