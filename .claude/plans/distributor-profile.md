Feature: distributor-profile | Page: /profile/[id]
Wireframe: specs/ui-ux/image-5.png, image-6.png (ui-ux.md §7) — phần thông tin + nút; tabs "Sản phẩm" / "Đánh giá" NGOÀI scope (làm sau)
API: GET /distributors/:distributorId (public), GET /users/me, GET /users/me/addresses, PATCH /users/me, POST /media/presign-url (+ PUT signed URL),
     POST /reviews (targetType USER), GET /chat/rooms (tìm room có sẵn), GET /provinces + /provinces/:code/wards (tên tỉnh/xã)
Decisions:
  - Page rẽ nhánh server theo hasSession (giống "/"): guest không gọi /users/me. Prefetch distributor profile (public) + me; owner prefetch thêm addresses.
    404 USER_DISTRIBUTOR_NOT_FOUND → notFound().
  - Header: giống "/" (guest: Login/Register; đã login: Notification/Chat/User menu + RealtimeProvider).
  - Nguồn data bảng thông tin:
    + Mọi viewer: /distributors/:id → username, avatar (media id → chữ cái đầu), Email / Phone (email ?? phone), bussinessType, bio,
      bussinessLicense (signed URL → link "Xem giấy phép" mở tab mới; null → "Chưa cung cấp"), primary address.
    + Owner: Địa chỉ lấy /users/me/addresses (list đầy đủ, primary trước, badge "Mặc định"); viewer chỉ thấy primary address.
  - Buttons: owner (me.id === id) → "Chỉnh sửa"; FARMER → "Chat" + "Đánh giá"; guest / DISTRIBUTOR khác → không nút nào (không làm M1).
  - Chat: tìm room có otherUserId = id trong các trang rooms đã tải → roomId; không thấy → receiverId (server tự tìm room theo cặp). Dùng lại ChatModal.
  - Review (M4): star 1..5 + content 1..1000 (trim). Không có API "đã review chưa" → xử lý 409 REVIEW_ALREADY_EXISTS (thông báo trong dialog), 403 REVIEW_REVIEWER_NOT_ALLOWED
    (farmer chưa ACTIVE). Thành công → đóng dialog + invalidate reviews.all (tab Đánh giá sau này dùng).
  - Edit profile (M6): username, avatar (IMAGE), bio, bussinessType, bussinessLicense (IMAGE | FILE pdf). Upload: presign → PUT signed URL → PATCH /users/me với { key, type, extension, filename }.
    Thành công → invalidate users.me + distributors.detail(id). Không làm M7 (manage address), M10.
  - Tên tỉnh/xã: address trả codename → tra tên qua provinces/wards (cache dài).
Foundation: có đủ (http/query/form/validation, BFF auth + forward, proxy, realtime). Thiếu: openapi.d.ts chưa có schema mới (gen:api), token màu sao rating.

- [x] 1. [feature-api]          `npm run gen:api` + GET /distributors/:id → TDistributorProfile, getDistributorProfile, distributorProfileQuery, useDistributorProfile; keys distributors.detail(id)
- [x] 2. [feature-api]          GET /users/me/addresses → TMyAddress, myAddressesQuery, useMyAddresses; keys users.addresses
- [x] 3. [feature-scaffold]     features `media` (services, hooks, types) và `review` (components, hooks, services, schemas, types)
- [x] 4a. [data-wrapper]        http: putToSignedUrl(url, file, { headers, signal }) — PUT Blob lên URL tuyệt đối, đúng headers presign, không credentials; lỗi → AppError (0 NETWORK_ERROR | UPLOAD_FAILED)
- [x] 4. [feature-api]          POST /media/presign-url → presignUrls; uploadMedia(files) = presign + putToSignedUrl song song → [{ key, type, extension, filename }] (shape AvatarFileDto / BusinessLicenseFileDto); useUploadMedia (invalidates: false)
- [x] 5. [feature-api]          PATCH /users/me → TUpdateProfileInput, useUpdateMe; invalidates users.me + distributors.detail(me.id)
- [x] 6. [feature-api]          POST /reviews → TCreateReviewInput, useCreateReview; keys reviews.all (namespace mới); invalidates reviews.all
- [x] 7. [validation-schema]    updateProfileSchema (feature user) — username 1..100, bio ≤1000, bussinessType, file avatar/license (đuôi cho phép)
- [x] 8. [validation-schema]    reviewSchema (feature review) — star 1..5, content 1..1000 sau trim
- [x] 9. [design-token]         màu sao rating (`rating` / `rating-muted`) light + dark
- [x] 10. [shared-unit]         hook useAddressLabel (feature location) — codename → "số nhà, xã, tỉnh"
- [x] 11. [atomic-component]    atom      StarRatingInput         (new, shared) — radio 1..5 sao, keyboard, aria
- [x] 12. [atomic-component]    molecule  FileInputField          (new, shared) — chọn file (accept), hiện tên/ảnh xem trước, xoá chọn
- [x] 13. [atomic-component]    molecule  InfoTable               (new, shared) — các hàng label / value (bảng thông tin wireframe), responsive
- [x] 14. [atomic-component]    molecule  AddressList             (new, feature location) — list address (useAddressLabel), badge primary
- [x] 15. [atomic-component]    organism  ReviewShopDialog        (new, feature review) — M4: StarRatingInput + Textarea, lỗi 409/403
- [x] 16. [atomic-component]    organism  EditProfileDialog       (new, feature user) — M6: form + 2 FileInputField, upload rồi PATCH
- [x] 17. [atomic-component]    organism  DistributorProfileInfo  (new, feature distributor) — title + slot actions + InfoTable (Email / Phone, Giấy phép, Địa chỉ, Lĩnh vực, Giới thiệu); loading/error
- [ ] 18. [atomic-component]    organism  DistributorProfileActions (new, feature distributor) — owner: Edit → EditProfileDialog; FARMER: Chat → ChatModal, Đánh giá → ReviewShopDialog
- [ ] 19. [atomic-component]    template  ProfileLayout           (new, shared) — header + vùng thông tin + slot tabs (để trống, làm sau)
- [ ] 20. [page]                page /profile/[id] — hasSession branching, prefetch, notFound, generateMetadata, loading/error/not-found
- [ ] 21. [arch-review]

Components (in order):
  [atom]      StarRatingInput            new    shared
  [atom]      Avatar, Button, Dialog, Input, Textarea, Select, Label  reuse  shared
  [molecule]  FileInputField             new    shared
  [molecule]  InfoTable                  new    shared
  [molecule]  FormField                  reuse  shared
  [molecule]  AddressList                new    feature location
  [organism]  ReviewShopDialog           new    feature review
  [organism]  EditProfileDialog          new    feature user
  [organism]  ChatModal                  reuse  feature chat
  [organism]  DistributorProfileInfo     new    feature distributor
  [organism]  DistributorProfileActions  new    feature distributor
  [organism]  SiteHeader, NotificationMenu, ChatRoomsMenu, UserMenu  reuse
  [template]  ProfileLayout              new    shared
  [page]      ProfilePage                new    app/profile/[id]

Resolved:
  - Email / Phone + bussinessLicense (signed URL) đã có trong DistributorProfileResponse / UserProfileResponse (openapi mới) — step 1 chạy gen:api.
  - Viewer chỉ thấy primary address (list đầy đủ owner-only theo API) — OK.
