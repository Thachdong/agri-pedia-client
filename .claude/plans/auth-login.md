Feature: auth-login | Page: /auth/login
Wireframe: specs/ui-ux/image-2.png (specs/ui-ux/ui-ux.md §3)
API: POST /auth/login (BFF route src/app/api/auth/login/route.ts đã có — ghi cookie httpOnly, trả { user })
Decisions: login không áp rule độ mạnh password (chỉ 1..128) | thành công → router.replace(next an toàn | /) + router.refresh() | invalidate toàn bộ cache (dữ liệu public phụ thuộc trạng thái đăng nhập) | chưa có GET /users/me → profile `user` trả về chưa lưu, để feature header/home quyết định
Foundation: data-wrapper ✓ bff-auth ✓ (login route, /auth/login đã guest-only, LOGIN_NEXT_PARAM) bff-forward ✓ tokens ✓ arch-lint ✓

- [x] 1. [feature-api]           POST /auth/login (qua BFF route) → TLoginInput, TLoginUser, login, useLogin (silent, invalidate toàn bộ)
- [ ] 2. [validation-schema]     loginSchema — loginType, identifier theo loginType (email|phone), password bắt buộc (<=128)
- [ ] 3. [shared-unit]           util getSafeNextPath (feature auth) — chỉ nhận path nội bộ "/..." (chặn "//", "http:", "/api"), fallback /
- [ ] 4. [shared-unit]           handoff flow "login" (loginType + identifier) — ActivateForm (activate OK) + RegisterForm (FARMER OK) lưu trước khi redirect /auth/login
- [ ] 5. [atomic-component]      organism  LoginForm          (new, feature auth) tabs EMAIL|PHONE (đổi tab clear identifier), identifier, PasswordInput, LOGIN loading; init từ handoff "login" (điền sẵn, focus password | focus identifier); lỗi → form; thành công → clear handoff + redirect next
- [ ] 6. [page]                  /auth/login ← AuthLayout + AuthHeader + LoginForm(next từ searchParams) + AuthFooterLinks(register, activate, resetPassword); metadata; loading/error
- [ ] 7. [arch-review]

Components (in order):
  [atom]      Button, Input, Label, Tabs   reuse  shared
  [molecule]  FormField         reuse  shared
  [molecule]  PasswordInput     reuse  shared
  [molecule]  LoginTypeTabs     reuse  feature auth
  [molecule]  AuthFooterLinks   reuse  feature auth
  [organism]  AuthHeader        reuse  feature auth
  [organism]  LoginForm         new    feature auth
  [template]  AuthLayout        reuse  shared
  [page]      LoginPage         new    app/(auth)/auth/login

Error mapping (LoginForm):
  USER_INVALID_CREDENTIALS → form: "Email/số điện thoại hoặc mật khẩu không đúng"
  USER_NOT_ACTIVE          → form: "Tài khoản chưa được kích hoạt." + link /auth/activate (lưu handoff "register" với at=0 → activate điền sẵn identifier, resend bật ngay)
  400 validation           → applyServerErrors vào field

Resolved: step 4 làm | sau login → next (an toàn) hoặc /
