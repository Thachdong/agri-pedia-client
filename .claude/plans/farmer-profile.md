Feature: farmer-profile (+ quản lý address cho distributor) | Page: /profile/me (FARMER) + cập nhật /profile/[id] (owner DISTRIBUTOR)
Wireframe: không có ảnh riêng — dùng bố cục §7 (image-5, phần thông tin) bỏ tabs; M7 "Manage address" (ui-ux.md §7) gộp vào dialog Chỉnh sửa
API: GET /users/me, GET /users/me/addresses, PATCH /users/me, POST /users/me/addresses,
     PATCH /users/me/addresses/:addressId/primary, DELETE /users/me/addresses/:addressId (409 USER_ADDRESS_PRIMARY_NOT_DELETABLE)
Decisions:
  - Route /profile/me (segment tĩnh, thắng /profile/[id]) — login required (PROTECTED_PATHS).
    FARMER → trang farmer. DISTRIBUTOR → redirect /profile/<me.id> (trang distributor có tabs).
    UserMenu "Trang cá nhân": FARMER → /profile/me, DISTRIBUTOR → /profile/<id> như cũ. ROUTES.myProfile mới.
  - Farmer info: tiêu đề avatar + username + nút "Chỉnh sửa"; InfoTable: Email / Phone, Giới thiệu, Địa chỉ.
  - Địa chỉ dạng radio cho CHỦ PROFILE ở cả 2 trang (farmer + distributor owner): chọn radio → PATCH primary ngay
    (radio khoá khi đang gửi, lỗi → toast, radio về primary cũ). Viewer khác của distributor vẫn thấy AddressList (chỉ primary).
  - Dialog Chỉnh sửa (EditProfileDialog, theo role):
    + Email / Phone read-only (không có API sửa).
    + FARMER: username, avatar, bio. DISTRIBUTOR: như cũ + bussinessType, giấy phép.
    + Section "Địa chỉ": radio set primary / nút xoá từng địa chỉ (ConfirmDialog; primary không xoá được → disable + gợi ý) /
      "Thêm địa chỉ" mở form inline (AddressFields + map). Set primary, create, delete: mỗi thao tác 1 API call riêng, gọi ngay,
      độc lập nút "Lưu" (PATCH /users/me) của hồ sơ.
    + Address mới tạo isPrimary = false (đổi mặc định bằng radio).
  - Invalidate: create / set primary → users.addresses + users.me + distributors.detail(me.id) + distributors.nearbyLists
    (primary đổi tâm tìm nhà phân phối gần farmer); delete → users.addresses.

- [x] 1. [bff-auth]             PROTECTED_PATHS thêm /profile/me; ROUTES.myProfile
- [x] 2. [feature-api]          POST /users/me/addresses → TCreateAddressInput, createMyAddress, useCreateMyAddress; invalidates như trên
- [x] 3. [feature-api]          PATCH /users/me/addresses/:id/primary → setMyPrimaryAddress, useSetMyPrimaryAddress; invalidates như trên
- [x] 4. [feature-api]          DELETE /users/me/addresses/:id → deleteMyAddress, useDeleteMyAddress; invalidates users.addresses; message 409
- [x] 5. [validation-schema]    createAddressSchema (feature user) — province, ward, houseNumber ≤255 (trim), lat/long trong khoảng, bắt chọn vị trí
- [x] 6. [validation-schema]    updateFarmerProfileSchema (feature user) — username 1..100, bio ≤1000, avatar uploadedFile
- [x] 7. [atomic-component]     molecule  AddressRadioList        (new, feature location) — radio theo address id (useAddressLabel), value = primary, slot action từng dòng, disabled
- [x] 8. [atomic-component]     organism  PrimaryAddressPicker    (new, feature user) — useMyAddresses + AddressRadioList + useSetMyPrimaryAddress (dùng ở trang info cả 2 role)
- [x] 9. [atomic-component]     organism  AddAddressForm          (new, feature user) — AddressFields + Lưu / Huỷ, POST address, lỗi server
- [x] 10. [atomic-component]    organism  ManageAddressesSection  (new, feature user) — AddressRadioList (set primary) + xoá (ConfirmDialog) + AddAddressForm; loading/error/empty
- [x] 11. [atomic-component]    organism  EditProfileDialog       (update, feature user) — theo role (FARMER bỏ bussinessType/giấy phép), email/phone read-only, gắn ManageAddressesSection
- [ ] 12. [atomic-component]    organism  FarmerProfileInfo       (new, feature user) — title + nút Chỉnh sửa + InfoTable (Email / Phone, Giới thiệu, Địa chỉ = PrimaryAddressPicker); loading/error
- [ ] 13. [atomic-component]    organism  DistributorProfileInfo  (update, feature distributor) — owner: Địa chỉ = PrimaryAddressPicker thay AddressList
- [ ] 14. [atomic-component]    organism  UserMenu                (update, feature user) — "Trang cá nhân" theo role
- [ ] 15. [page]                page /profile/me — prefetch me + addresses, DISTRIBUTOR → redirect /profile/<id>, ProfileLayout không tabs, metadata, loading/error
- [ ] 16. [arch-review]

Components (in order):
  [atom]      RadioGroup, RadioGroupItem, Button, Avatar, Dialog, Input, Textarea, Select  reuse  shared
  [molecule]  InfoTable, FormField, FileInputField, ConfirmDialog                      reuse  shared
  [molecule]  AddressFields, AddressList                                              reuse  feature location
  [molecule]  AddressRadioList           new     feature location
  [organism]  PrimaryAddressPicker       new     feature user
  [organism]  AddAddressForm             new     feature user
  [organism]  ManageAddressesSection     new     feature user
  [organism]  EditProfileDialog          update  feature user
  [organism]  FarmerProfileInfo          new     feature user
  [organism]  DistributorProfileInfo     update  feature distributor
  [organism]  UserMenu                   update  feature user
  [organism]  SiteHeader, NotificationMenu, ChatRoomsMenu  reuse
  [template]  ProfileLayout              reuse   shared (tabs đã optional)
  [page]      MyProfilePage              new     app/profile/me

Resolved:
  1. Route farmer: /profile/me.
  2. Radio set primary trên trang info: cả farmer và distributor (owner).
  3. Set primary, create, delete address: mỗi cái 1 API call riêng, gọi ngay.
