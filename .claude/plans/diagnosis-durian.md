Feature: diagnosis (thêm cây sầu riêng) | Pages: header (mọi trang đã đăng nhập), /diagnosis/new, /diagnosis/[id], /diagnosis, /diseases/[code]
Spec: specs/openapi.json (GET /knowledge/crops có plantParts + cropStages theo cây; enum bộ phận / giai đoạn / tác nhân / verification mở rộng)
API: GET /knowledge/crops, POST /diagnoses (plantPart thuộc plantParts của cây), GET /knowledge/diseases/:code
Kết quả: giữ cấu trúc như lúa (tổng hợp → từng ảnh → disclaimer, dialog bệnh)

- [x] 1. [feature-api]        `npm run gen:api`; TCrop có plantParts / cropStages → TCropPlantPart, TCropStage
- [x] 2. [shared-unit]        constants: nhãn bộ phận / giai đoạn / tác nhân mở rộng (OOMYCETE, ALGA; SHOOT…ARIL; YOUNG_TREE…TREE_RECOVERY) làm fallback
- [x] 3. [shared-unit]        hook useCropLabels(cropType?) — nhãn bộ phận / giai đoạn theo cây (từ GET /knowledge/crops), fallback constants
- [x] 4. [atomic-component]  molecule  PlantPartSelect      — options theo bộ phận của cây (prop), không cố định 6 bộ phận lúa
- [x] 5. [atomic-component]  organism  StartDiagnosisButton — bấm → dropdown chọn cây (Lúa / Sầu riêng…), mỗi option → /diagnosis/new?crop=; bỏ CropPickerDialog
- [x] 6. [atomic-component]  organism  DiagnosisForm        — nhận plantParts của cây, truyền cho PlantPartSelect
- [x] 7. [atomic-component]  organism  kết quả (Summary, ResultTable, ResultImage, RegionOverlay?, DiseaseArticle / dialog) — nhãn bộ phận / giai đoạn theo cây
- [x] 8. [page]              /diagnosis/new truyền plantParts của cây; kiểm tra lại /diagnosis/[id], /diseases/[code]
- [ ] 9. [arch-review]

Components (in order):
  [atom]      DropdownMenu*          reuse  shared
  [molecule]  PlantPartSelect        change feature
  [organism]  StartDiagnosisButton   change feature
  [organism]  CropPickerDialog       remove feature
  [organism]  DiagnosisForm          change feature
  [organism]  DiagnosisSummary / DiagnosisResultTable / DiagnosisResultImage / DiseaseArticle   change feature
  [template]  ContentLayout          reuse  shared
  [page]      /diagnosis/new         change

Decisions:
  - Dropdown luôn hiện (kể cả khi chỉ 1 cây) — theo yêu cầu "click → dropdown".
  - Nhãn bộ phận / giai đoạn lấy từ crops API theo cây (vd. SEEDLING: lúa "Mạ", sầu riêng "Cây con / vườn ươm"); /diseases/[code] không biết cây → nhãn chung trong constants.
  - verification SECONDARY vẫn ≠ SOURCED → vẫn hiện "chưa được chuyên gia xác nhận" (theo openapi).
  - Session này tự commit sau mỗi bước, không dừng chờ review.
