# diagnosis-share — gửi report chẩn đoán cho distributor qua chat

Feature: diagnosis-share | Page: /diagnosis/[id] (+ Chat modal ở mọi trang có header đầy đủ)
Spec: Specs/19102026/farmer.md (diagnose report page), distributor.md (không thấy nút "gửi report")
Wireframe: không có — theo spec + pattern sẵn có (Dialog, ChatRoomItem, ChatMessageBubble)
API:
- socket `chat.message.send` { roomId | receiverId, message, type: "DIAGNOSIS_REPORT", diagnosisId } (FARMER, diagnosis COMPLETED)
- GET /chat/rooms/{roomId}/messages/{messageId}/diagnosis (2 thành viên room đọc report)
- GET /chat/rooms (danh sách room — đã có)
- GET /distributors/nearby { lat, long } | { provinceCode, wardCode } (đã có)

Phụ thuộc feature (tránh vòng: distributor → chat đã có):
- chat → diagnosis (bubble report mở DiagnosisReportView)
- diagnosis-share (mới) → chat, diagnosis, distributor, location, user

## Steps
- [x] 1. [feature-scaffold]     feature `diagnosis-share` — layers: components (+ index)
- [x] 2. [feature-api]          socket chat.message.send DIAGNOSIS_REPORT — TSendMessageInput thêm type + diagnosisId; useSendMessage ghi đúng type/diagnosisId vào cache
- [x] 3. [feature-api]          GET /chat/rooms/{roomId}/messages/{messageId}/diagnosis → getMessageDiagnosis (chuẩn hoá về TDiagnosis), key chat.messageDiagnosis, useMessageDiagnosis
- [x] 4. [shared-unit]          util formatReportMessage(cropName, diagnosedAt) + CHAT_REPORT_LABEL — đặt ở feature chat (bubble/preview dùng chung label), diagnosis-share import qua index
- [x] 5. [atomic-component]     organism  DiagnosisReportView   (new, feature diagnosis) — tách header + tổng hợp + từng ảnh + disclaimer khỏi DiagnosisResult, nhận data; DiagnosisResult dùng lại
- [x] 6. [atomic-component]     organism  ChatReportDialog      (new, feature chat) — useMessageDiagnosis + DiagnosisReportView, loading / lỗi / thử lại
- [x] 7. [atomic-component]     molecule  ChatReportBubble      (new, feature chat) — bong bóng DIAGNOSIS_REPORT: icon + tên cây + thời gian, click → ChatReportDialog; ChatModal render theo `type`
- [x] 8. [atomic-component]     molecule  ChatRoomItem          (update, feature chat) — preview tin cuối là report: icon + "Báo cáo chẩn đoán"; export ChatRoomItem
- [x] 9. [atomic-component]     molecule  DistributorCard       (update, feature distributor) — thay SupplierOption: thêm `onChoose` → card thành nút chọn; export ra index
- [x] 10. [atomic-component]    organism  FindSupplierDialog    (new, feature diagnosis-share) — 2 tab: Gần tôi (định vị) | Theo tỉnh thành (tỉnh + xã); danh sách nearby cuộn tải thêm; chọn → onSelect
- [x] 11. [atomic-component]    organism  SendReportDialog      (new, feature diagnosis-share) — danh sách chat room → chọn → ConfirmDialog "Gửi report cho <tên>?" → gửi; nút "Tìm nhà cung cấp" → FindSupplierDialog → chọn → confirm → gửi bằng receiverId; gửi xong đóng dialog + mở ChatModal room đó
- [x] 12. [atomic-component]    organism  SendReportButton      (new, feature diagnosis-share) — chỉ FARMER + diagnosis COMPLETED; mở SendReportDialog
- [x] 13. [page]                /diagnosis/[id] — gắn SendReportButton qua slot `actions` mới của DiagnosisResult / DiagnosisReportView (cạnh tiêu đề; ContentLayout.actions để lại hàng trống khi nút ẩn)
- [ ] 14. [arch-review]

## Components (in order)
  [atom]      Button, Avatar, Badge     reuse  shared
  [molecule]  Callout                    reuse  shared
  [molecule]  ChatMessageBubble          reuse  feature chat
  [molecule]  ChatReportBubble           new    feature chat
  [molecule]  ChatRoomItem               update feature chat
  [molecule]  DistributorCard            update feature distributor (thay SupplierOption)
  [organism]  DiagnosisSummary, DiagnosisResultImage  reuse  feature diagnosis
  [organism]  DiagnosisReportView        new    feature diagnosis
  [organism]  DiagnosisResult            update feature diagnosis
  [organism]  ChatReportDialog           new    feature chat
  [organism]  ChatModal                  update feature chat
  [organism]  FindSupplierDialog         new    feature diagnosis-share
  [organism]  SendReportDialog           new    feature diagnosis-share
  [organism]  SendReportButton           new    feature diagnosis-share
  [template]  ContentLayout              reuse  shared
  [page]      DiagnosisDetailPage        update app/diagnosis/[id]

  [molecule]  ConfirmDialog              reuse  shared

## Decisions
- Thời gian trên bong bóng = diagnosis.createdAt (lúc tạo chẩn đoán).
- Chọn room / nhà cung cấp → ConfirmDialog → gửi.
- Gửi xong → mở ChatModal room đó.

- Bong bóng: cách A — client ghi text vào `message` lúc gửi (không đổi API).
