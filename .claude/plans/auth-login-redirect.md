Feature: auth-login-redirect | Page: /auth/login (điều hướng sau khi login)
Wireframe: không có ảnh mới — rule từ developer: FARMER → /, DISTRIBUTOR → /profile/<id>
API: POST /auth/login — user giờ là UserProfileResponse (có id, address); đã chạy `npm run gen:api`
Decisions:
  - `?next=` hợp lệ (getSafeNextPath) vẫn ưu tiên hơn rule theo role (user bị proxy đẩy về login thì quay lại đúng trang đang mở)
  - không có next: DISTRIBUTOR → /profile/<user.id>, FARMER → /
  - GET /users/me chưa dùng ở đây (response login đã đủ) — để feature header/profile dùng sau
  - /profile/[id] chưa build → DISTRIBUTOR login xong sẽ 404 tới khi làm trang profile
Foundation: đủ. `npm run gen:api` đã đổi LoginUserProfileResponse → UserProfileResponse ⇒ tsc đang lỗi, step 1 sửa

- [x] 1. [feature-api]           POST /auth/login — TLoginUser = UserProfileResponse (sửa lỗi tsc sau gen:api), BFF route tự nhận `id` qua LoginUserResponse["user"]
- [x] 2. [shared-unit]           constant ROUTES.profile(id) (shared)
- [x] 3. [shared-unit]           util getPostLoginPath(user, next) (feature auth) — next an toàn nếu có, không thì theo role
- [ ] 4. [atomic-component]      organism  LoginForm  (update, feature auth) onSuccess dùng user trả về + getPostLoginPath
- [ ] 5. [arch-review]

Components (in order):
  [organism]  LoginForm   update  feature auth
  [page]      LoginPage   reuse   app/(auth)/auth/login

Resolved: có next an toàn → next; không có → theo role
