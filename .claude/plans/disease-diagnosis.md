Feature: diagnosis | Pages: /diagnosis/new, /diagnosis/[id], /diagnosis, /diseases/[code]
Spec: specs/disease-diagnose-plan.md (không có wireframe — layout đề xuất ở cuối file)
API: GET /knowledge/crops, GET /knowledge/diseases/:code, POST /diagnoses (multipart), GET /diagnoses/:id, GET /diagnoses, POST /diagnoses/:id/feedback, realtime `diagnosis.completed`

- [x] 1. [design-token]       tokens trạng thái: success / warning / info (+ foreground, subtle) cho badge tin cậy, cảnh báo mờ, banner chưa xác nhận
- [ ] 2. [shared-unit]        ROUTES.diagnosis {list, new(crop), detail(id)}, ROUTES.disease(code); PROTECTED_PATHS += /diagnosis
- [ ] 3. [feature-scaffold]   feature `diagnosis` — layers: components, hooks, services, schemas, types, utils, constants
- [ ] 4. [feature-api]        `npm run gen:api` + GET /knowledge/crops → TCrop, getCrops, useCrops; keys knowledge.crops
- [ ] 5. [feature-api]        GET /knowledge/diseases/:code → TDisease, diseaseQuery (prefetch được), useDisease; keys knowledge.disease(code)
- [ ] 6. [feature-api]        POST /diagnoses (FormData) → createDiagnosis, useCreateDiagnosis; invalidates diagnoses.lists
- [ ] 7. [feature-api]        GET /diagnoses/:id → TDiagnosis (override category enum), diagnosisQuery, useDiagnosis; keys diagnoses.detail(id)
- [ ] 8. [feature-api]        GET /diagnoses (infinite, cursor) → TDiagnosisListItem, useDiagnosisHistory; keys diagnoses.lists
- [ ] 9. [feature-api]        POST /diagnoses/:id/feedback → useDiagnosisFeedback; invalidates diagnoses.detail(id), diagnoses.lists
- [ ] 10. [validation-schema] diagnosisFormSchema (1..5 ảnh, plantPart bắt buộc, note ≤ 1000)
- [ ] 11. [validation-schema] diagnosisFeedbackSchema (feedback bắt buộc, comment ≤ 1000)
- [ ] 12. [shared-unit]       feature constants: PLANT_PART / CONFIDENCE / CATEGORY / STATUS labels + tone, MAX_IMAGES, MAX_EDGE, POLL_*, BLUR_THRESHOLD, DIAGNOSIS_EVENTS
- [ ] 13. [shared-unit]       util compressImage (EXIF, ≤2048px, JPEG 0.85 → 0.7)
- [ ] 14. [shared-unit]       util blurScore (phương sai Laplacian ~512px)
- [ ] 15. [shared-unit]       hook useCameraStream (getUserMedia environment, cleanup, phát hiện không hỗ trợ / bị từ chối / không HTTPS)
- [ ] 16. [shared-unit]       hook useDiagnosisLive (useDiagnosis + realtime `diagnosis.completed` + poll 3s khi PROCESSING, dừng sau 5 phút, refetch khi reconnect)
- [ ] 17. [atomic-component]  atom      Badge                 (new, shared)
- [ ] 18. [atomic-component]  molecule  Callout               (new, shared)
- [ ] 19. [atomic-component]  atom      ConfidenceBadge       (new, feature)
- [ ] 20. [atomic-component]  atom      DiagnosisStatusBadge  (new, feature)
- [ ] 21. [atomic-component]  molecule  PlantPartSelect       (new, feature)
- [ ] 22. [atomic-component]  molecule  AddImageTile          (new, feature)
- [ ] 23. [atomic-component]  molecule  DiagnosisImageSlot    (new, feature)
- [ ] 24. [atomic-component]  molecule  RegionOverlay         (new, feature)
- [ ] 25. [atomic-component]  molecule  DiagnosisResultTable  (new, feature)
- [ ] 26. [atomic-component]  molecule  DiseaseCard           (new, feature)
- [ ] 27. [atomic-component]  molecule  DiagnosisHistoryItem  (new, feature)
- [ ] 28. [atomic-component]  organism  CropPickerDialog      (new, feature)
- [ ] 29. [atomic-component]  organism  DiagnosisHeaderButton (new, feature) ← useCrops
- [ ] 30. [atomic-component]  organism  CameraCaptureDialog   (new, feature)
- [ ] 31. [atomic-component]  organism  DiagnosisForm         (new, feature) ← useCreateDiagnosis
- [ ] 32. [atomic-component]  organism  DiagnosisStatusPanel  (new, feature) — PROCESSING / quá 5 phút / FAILED
- [ ] 33. [atomic-component]  organism  DiagnosisSummary      (new, feature)
- [ ] 34. [atomic-component]  organism  ImageLightbox         (new, feature)
- [ ] 35. [atomic-component]  organism  DiagnosisResultImage  (new, feature)
- [ ] 36. [atomic-component]  organism  RelatedDiseases       (new, feature) ← useDisease × N
- [ ] 37. [atomic-component]  organism  DiagnosisFeedback     (new, feature) ← useDiagnosisFeedback
- [ ] 38. [atomic-component]  organism  DiagnosisResult       (new, feature) ← useDiagnosisLive
- [ ] 39. [atomic-component]  organism  DiagnosisHistoryList  (new, feature) ← useDiagnosisHistory
- [ ] 40. [atomic-component]  organism  DiseaseDetail         (new, feature)
- [ ] 41. [atomic-component]  template  ContentLayout         (new, shared) — header sticky + main max-w + footer sticky tuỳ chọn
- [ ] 42. [page]              /diagnosis/new ← DiagnosisForm (kiểm tra `crop` qua knowledge.crops)
- [ ] 43. [page]              /diagnosis/[id] ← prefetch diagnosisQuery, DiagnosisResult (+ loading / error / not-found)
- [ ] 44. [page]              /diagnosis ← DiagnosisHistoryList
- [ ] 45. [page]              /diseases/[code] (public) ← prefetch diseaseQuery, DiseaseDetail (+ not-found)
- [ ] 46. [page]              gắn DiagnosisHeaderButton vào actions header (app/page.tsx, profile/*, diagnosis/*) + link "Lịch sử chẩn đoán" trong UserMenu
- [ ] 47. [arch-review]

Components (in order):
  [atom]      Badge                  new    shared
  [atom]      Button                 reuse  shared
  [atom]      Dialog/Select/Textarea/Popover  reuse  shared
  [molecule]  Callout                new    shared
  [molecule]  FormField              reuse  shared
  [molecule]  InfoTable              reuse  shared   (meta bệnh trong DiseaseDetail)
  [atom]      ConfidenceBadge        new    feature
  [atom]      DiagnosisStatusBadge   new    feature
  [molecule]  PlantPartSelect        new    feature
  [molecule]  AddImageTile           new    feature
  [molecule]  DiagnosisImageSlot     new    feature
  [molecule]  RegionOverlay          new    feature
  [molecule]  DiagnosisResultTable   new    feature
  [molecule]  DiseaseCard            new    feature
  [molecule]  DiagnosisHistoryItem   new    feature
  [organism]  SiteHeader             reuse  shared
  [organism]  UserMenu / NotificationMenu / ChatRoomsMenu  reuse  feature (user/notification/chat)
  [organism]  CropPickerDialog       new    feature
  [organism]  DiagnosisHeaderButton  new    feature
  [organism]  CameraCaptureDialog    new    feature
  [organism]  DiagnosisForm          new    feature
  [organism]  DiagnosisStatusPanel   new    feature
  [organism]  DiagnosisSummary       new    feature
  [organism]  ImageLightbox          new    feature
  [organism]  DiagnosisResultImage   new    feature
  [organism]  RelatedDiseases        new    feature
  [organism]  DiagnosisFeedback      new    feature
  [organism]  DiagnosisResult        new    feature
  [organism]  DiagnosisHistoryList   new    feature
  [organism]  DiseaseDetail          new    feature
  [template]  ContentLayout          new    shared
  [page]      DiagnosisNewPage       new    app/diagnosis/new
  [page]      DiagnosisDetailPage    new    app/diagnosis/[id]
  [page]      DiagnosisHistoryPage   new    app/diagnosis
  [page]      DiseaseDetailPage      new    app/diseases/[code]
Reuse hooks: useImagePreview, useInfiniteSentinel, useRealtimeEvent, toast.

Layout đề xuất (mobile trước):

/diagnosis/new
  header sticky
  ┌ max-w-3xl ───────────────────────────┐
  │ H1 "Chẩn đoán bệnh — Lúa"             │
  │ Callout info: mẹo chụp (gần, đủ sáng, │
  │   1 bộ phận/ảnh, vết bệnh giữa khung) │
  │ Ảnh (2/5)                             │
  │ [slot][slot]    grid 2 · sm 3 · lg 4  │
  │ [slot][ + ]     slot = thumb vuông +  │
  │                 X + chip "mờ" vàng +  │
  │                 select bộ phận dưới   │
  │                 ô +: 📷 Chụp | 🖼 Chọn │
  │ Ghi chú  [textarea]       0/1000      │
  │ lỗi chung (Callout danger)            │
  └───────────────────────────────────────┘
  footer sticky: "2/5 ảnh · thiếu bộ phận 1 ảnh"  [Gửi ▸]

/diagnosis/[id]
  PROCESSING: card giữa trang — spinner, "Đang phân tích ảnh…", "thường mất 10–30 giây",
              dải thumbnail ảnh đã gửi; quá 5 phút → Callout + [Tải lại] [Lịch sử]
  FAILED:     card — icon lỗi, thông báo, [Chẩn đoán lại]
  COMPLETED (max-w-4xl):
    Summary card: kết luận 1 dòng to + list bệnh (tên · ConfidenceBadge · "2/3 ảnh"),
                  Callout warning nếu conflict
    Ảnh 1..n (card mỗi ảnh): lg: 2 cột [ảnh + overlay | bảng kết quả]; mobile: xếp dọc
                  nhãn "Ảnh 1 · Lá" + note "AI nhận diện đây là Bẹ lá"
                  hover/chạm hàng bảng ↔ nổi khung; click ảnh → lightbox
    Bài viết liên quan: grid 1 · sm 2 DiseaseCard
    Phản hồi: 3 nút toggle + textarea + [Gửi phản hồi]
    Disclaimer: chữ nhỏ muted cuối trang

/diagnosis
  H1 "Lịch sử chẩn đoán" + [Chẩn đoán mới]
  list: [thumb 64] ngày · StatusBadge / chips bệnh + ConfidenceBadge   ›
  infinite sentinel; rỗng → empty state + [Chẩn đoán ngay]

/diseases/[code]
  article max-w-3xl: Callout warning nếu chưa xác nhận → H1 tên VN, phụ đề EN + khoa học (italic)
  → InfoTable meta (tên khác, nhóm, tác nhân, bộ phận, giai đoạn)
  → các mục H2 (tác nhân, triệu chứng, biến thể, lây lan, điều kiện, biện pháp, bệnh dễ nhầm, nguồn)

Header: nút "Chẩn đoán bệnh" — mobile icon-only (Stethoscope/ScanSearch) + aria-label, sm+ có chữ; đặt trước NotificationMenu.

Decisions:
  1. ConfidenceBadge: HIGH = success (xanh), MEDIUM = warning (vàng), LOW = muted (xám); vùng UNCERTAIN = xám nét đứt.
  2. Kết quả nhiều ảnh: xếp dọc.
  3. Session này: tự commit sau mỗi bước, không dừng chờ review. Commit message không ghi attribution.
