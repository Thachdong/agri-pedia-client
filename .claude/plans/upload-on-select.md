Feature: upload-on-select (refactor) | Dialogs: EditProfileDialog (M6), ProductFormDialog (M8/M9)
Wireframe: không đổi layout — chỉ thêm trạng thái upload (% tiến trình) trên ô file / tile ảnh
API: POST /media/presign-url (đã có) + PUT signed URL (putToSignedUrl). Không endpoint mới.

Hiện trạng: form giữ `File`; submit → useUploadMedia (presign + PUT cả lô) → PATCH /users/me | POST/PATCH /products.
Mục tiêu: chọn file → kiểm tra đuôi/dung lượng → presign + PUT ngay (có %); form giữ item `{ id, file, status, progress, media? }`;
lỗi (kiểm tra / presign / PUT) → bỏ file khỏi form + toast; submit chỉ gửi `media` (key) đã có;
chặn submit khi còn file đang tải; bỏ file hoặc đóng dialog → abort PUT.

- [x] 1. [data-wrapper]        toast: cài sonner (shadcn `sonner` atom Toaster) + wrapper `toast` trong shared/lib/toast + gắn Toaster vào AppProviders
- [x] 2. [data-wrapper]        http: putToSignedUrl chuyển sang XHR, thêm `onProgress(percent)`, giữ signal + mapping AppError
- [x] 3. [shared-unit]         type TFileUpload<TMedia> + TFileUploadStatus (uploading | done) + progress — shared/types, cho molecule hiển thị
- [x] 4. [feature-api]         media: uploadMedia nhận signal + onProgress; hook useMediaUploads (per-file state, pre-check đuôi/size, 1 presign/lô chọn, abort khi remove/unmount, lỗi → bỏ item + toast) thay useUploadMedia
- [x] 5. [validation-schema]   rules.uploadedFile (item phải done; uploading → "Đang tải file…") (schema + form types chuyển sang bước 6/7 để tsc luôn xanh)
- [x] 6. [atomic-component]    molecule FileInputField (update, value TFileUpload | null, hiện %) + organism EditProfileDialog (upload khi chọn, submit dùng media có sẵn) + updateProfileSchema / TUpdateProfileFormValues
- [x] 7. [atomic-component]    molecule MultiImageInput (update, value TFileUpload[], overlay %) + organism ProductFormDialog (như trên, sortOrder theo thứ tự tile) + create/updateProductSchema / TProductFormValues
- [x] 8. [cleanup]             bỏ uploadMedia, useUploadMedia, rules.file (deprecated)
- [ ] 9. [arch-review]

Components (in order):
  [atom]      Toaster             new     shared (shadcn sonner)
  [molecule]  FileInputField      update  shared
  [molecule]  MultiImageInput     update  shared
  [organism]  EditProfileDialog   update  feature user
  [organism]  ProductFormDialog   update  feature product

Quyết định:
- % tiến trình: có (XHR upload.onprogress).
- Lỗi upload: bỏ file khỏi form + toast (không retry).

Ghi chú / rủi ro:
- File bị bỏ sau khi đã lên TMP → mồ côi trong `tmp/<userId>/` (cron cleanup CHƯA IMPLEMENT, api.md 10). Chấp nhận, không có API xoá TMP.
- Presign URL có TTL: chỉ ảnh hưởng PUT (diễn ra ngay khi chọn) — key giữ trong form đến submit vẫn hợp lệ cho confirmMedia.
- Presign all-or-nothing: pre-check đuôi trước khi gọi nên 1 file sai không chặn cả lô.
- shared/lib/query/query-error.ts có chỗ đăng ký hiển thị lỗi global (toast) — không nối trong plan này, để riêng nếu muốn.
