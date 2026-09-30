Feature: auth-register | Page: /auth/register
Wireframe: specs/ui-ux/image.png (specs/ui-ux/ui-ux.md §1)
API: POST /auth/register, GET /provinces, GET /provinces/{provinceCode}/wards
Decisions: lat/long qua map picker trong dialog (Leaflet + OSM), có nút "Dùng vị trí hiện tại" (geolocation) làm shortcut | redirect theo role (DISTRIBUTOR → handoff + /auth/activate, FARMER → /auth/login) | có confirmPassword (client-only)
Foundation: data-wrapper ✓ bff-auth ✓ (/auth/register đã guest-only) bff-forward ✓ (/api/auth/register forward) tokens ✓ arch-lint ✓

- [x] 1. [feature-scaffold]      feature `auth` — layers: components, hooks, services, schemas, types, utils, constants
- [x] 2. [feature-scaffold]      feature `location` — layers: components, hooks, services, types
- [x] 3. [feature-api]           GET /provinces → TProvince, getProvinces, useProvinces; keys location.provinces
- [x] 4. [feature-api]           GET /provinces/{provinceCode}/wards → TWard, getWards, useWards(provinceCode, enabled khi có province); keys location.wards
- [x] 5. [feature-api]           POST /auth/register → TRegisterInput, register, useRegister (không invalidate)
- [x] 6. [validation-schema]     registerSchema — identifier theo loginType (email|phone), password, confirmPassword, username?, role, bussinessType (required DISTRIBUTOR / null FARMER), bio?, address (province, ward, houseNumber, lat, long)
- [x] 7. [arch-lint-setup]       cài leaflet + react-leaflet (+ @types/leaflet); rule: chỉ MapPicker được import leaflet/react-leaflet
- [x] 8. [shared-unit]           hook useGeolocation (shared) — request, loading, coords, error
- [x] 9. [shared-unit]           hook useAuthHandoff(flow) (feature auth) — sessionStorage save/read/clear {loginType, identifier, at} (util → hook: util phải pure)
- [x] 10. [atomic-component]     atoms shadcn (shared/ui): Button, Input, Label, Textarea, Select, Tabs, RadioGroup, Dialog — gộp 1 step vì là shadcn generate
- [x] 11. [atomic-component]     molecule  FormField          (new, shared)   label + control + error
- [x] 12. [atomic-component]     molecule  LoginTypeTabs      (new, feature auth)   EMAIL | PHONE, đổi tab clear identifier
- [x] 13. [atomic-component]     molecule  AuthFooterLinks    (new, feature auth)   links đăng ký / đăng nhập / kích hoạt / reset (cấu hình theo page)
- [x] 14. [atomic-component]     organism  MapPicker          (new, shared)   Leaflet client-only (dynamic ssr:false), click đặt marker, kéo marker, value/onChange {lat, long}
- [x] 15. [atomic-component]     organism  AuthHeader         (new, feature auth)   logo AgriPedia + "Back To Home"
- [x] 16. [atomic-component]     organism  LocationPickerField (new, feature location)   hiển thị lat/long + nút "Chọn trên bản đồ" → Dialog chứa MapPicker (Xác nhận / Huỷ) + nút "Dùng vị trí hiện tại"
- [x] 17. [atomic-component]     organism  AddressFields      (new, feature location)   province/ward select + houseNumber + LocationPickerField
- [x] 18. [atomic-component]     organism  RegisterForm       (new, feature auth)   useAppForm + registerSchema + useRegister, lỗi server (USER_IDENTIFIER_ALREADY_USED → identifier), handoff + redirect theo role
- [x] 19. [atomic-component]     template  AuthLayout         (new, shared)   header slot + card căn giữa, body scroll-y, footer slot
- [x] 20. [page]                 /auth/register ← AuthLayout + AuthHeader + RegisterForm + AuthFooterLinks; prefetch provinces; metadata
- [ ] 21. [arch-review]

Components (in order):
  [atom]      Button, Input, Label, Textarea, Select, Tabs, RadioGroup, Dialog   new  shared (shadcn)
  [molecule]  FormField           new    shared
  [molecule]  LoginTypeTabs       new    feature auth
  [molecule]  AuthFooterLinks     new    feature auth
  [organism]  MapPicker           new    shared
  [organism]  AuthHeader          new    feature auth
  [organism]  LocationPickerField new    feature location
  [organism]  AddressFields       new    feature location
  [organism]  RegisterForm        new    feature auth
  [template]  AuthLayout          new    shared
  [page]      RegisterPage        new    app/(auth)/auth/register

Notes:
  - LoginTypeTabs, AuthFooterLinks, AuthHeader, AuthLayout, handoff util sẽ tái dùng cho /auth/activate, /auth/login, /auth/reset-password.
  - Geolocation bị từ chối → vẫn chọn được trên map; map mở ở tâm VN (hoặc vị trí hiện tại nếu được cấp quyền).
  - Tile OpenStreetMap public: đủ cho dev/traffic thấp; production nhiều traffic nên đổi tile provider (config qua env.public).
