Feature: auth-reset-password | Pages: /auth/reset-password, /auth/change-password
Wireframe: specs/ui-ux/image-3.png (ui-ux.md §4), specs/ui-ux/image-7.png (ui-ux.md §5)
API: POST /auth/reset-password, POST /auth/reset-password/confirm, POST /auth/resend (purpose RESET_PASSWORD — đã có)
Decisions:
  - "change-password (by token)" trong ui-ux.md = POST /auth/reset-password/confirm { identifier, code, newPassword } (POST /auth/change-password là đổi mật khẩu khi đã login — không dùng)
  - reset 409 OTP_ALREADY_REQUESTED (code cũ còn hạn) → coi như thành công: handoff at = details.issuedAt → /auth/change-password (nhập code cũ hoặc resend khi hết cooldown)
  - handoff flow "reset-password" (đã có type) — at = requested at; resend thành công → lưu lại at = now
  - countdown resend: RESEND_CODE_COOLDOWN_MS (3 phút) tính từ `at`; không có handoff → resend enabled ngay
  - confirm thành công → clear handoff "reset-password" + lưu handoff "login" (điền sẵn identifier) → /auth/login
  - newPassword: rules.password() (giống register, 8..128); confirmPassword chỉ client
  - loginType chỉ để chọn rule identifier, không gửi confirm
Foundation: data-wrapper ✓ bff-forward ✓ (2 endpoint forward qua catch-all) tokens ✓ arch-lint ✓ | bff-auth: 2 path chưa guest-only

- [x] 1. [bff-auth]              thêm /auth/reset-password, /auth/change-password vào GUEST_ONLY_PATHS
- [x] 2. [feature-api]           POST /auth/reset-password → TRequestPasswordResetInput, requestPasswordReset, useRequestPasswordReset (silent, không invalidate)
- [x] 3. [feature-api]           POST /auth/reset-password/confirm → TConfirmPasswordResetInput, confirmPasswordReset, useConfirmPasswordReset (silent, không invalidate)
- [x] 4. [validation-schema]     resetPasswordSchema — loginType, identifier theo loginType
- [x] 5. [validation-schema]     changePasswordSchema — loginType, identifier, password (rule), confirmPassword = password, code OTP_CODE_LENGTH chữ số
- [x] 6. [atomic-component]      organism  ResetPasswordForm   (new, feature auth) tabs EMAIL|PHONE (clear identifier), autofocus identifier, RESET loading; lỗi → field/form; OK hoặc OTP_ALREADY_REQUESTED → handoff → /auth/change-password
- [x] 7. [atomic-component]      organism  ChangePasswordForm  (new, feature auth) init handoff (điền loginType+identifier, focus Password | EMAIL, focus identifier); identifier, PasswordInput x2, OtpCodeInput (xong → focus button), ResendCodeAction RESET_PASSWORD + countdown; lỗi → field/form; OK → clear handoff + handoff login → /auth/login
- [x] 8. [page]                  /auth/reset-password ← AuthLayout + AuthHeader + ResetPasswordForm + AuthFooterLinks(register, login, activate); metadata; loading/error
- [x] 9. [page]                  /auth/change-password ← AuthLayout + AuthHeader + ChangePasswordForm + AuthFooterLinks(register, login); metadata; loading/error
- [x] 10. [arch-review]

Components (in order):
  [atom]      Button, Input, Label, Tabs, InputOTP   reuse  shared
  [molecule]  FormField           reuse  shared
  [molecule]  PasswordInput       reuse  shared
  [molecule]  OtpCodeInput        reuse  shared
  [molecule]  LoginTypeTabs       reuse  feature auth
  [molecule]  AuthFooterLinks     reuse  feature auth
  [molecule]  ResendCodeAction    reuse  feature auth
  [organism]  AuthHeader          reuse  feature auth
  [organism]  ResetPasswordForm   new    feature auth
  [organism]  ChangePasswordForm  new    feature auth
  [template]  AuthLayout          reuse  shared
  [page]      ResetPasswordPage   new    app/(auth)/auth/reset-password
  [page]      ChangePasswordPage  new    app/(auth)/auth/change-password

Error mapping (ResetPasswordForm — POST /auth/reset-password):
  OTP_ACCOUNT_NOT_FOUND   → identifier: "Không tìm thấy tài khoản với email/số điện thoại này"
  OTP_ACCOUNT_NOT_ACTIVE  → form: "Tài khoản chưa được kích hoạt." + link /auth/activate
  OTP_ALREADY_REQUESTED   → không phải lỗi: handoff at = issuedAt → /auth/change-password
  OTP_BLOCKED             → form: "Tạm khoá, thử lại sau <blockUntil>"
  400 validation          → applyServerErrors

Error mapping (ChangePasswordForm — POST /auth/reset-password/confirm + /auth/resend):
  OTP_INVALID_CODE        → code: "Mã không đúng"
  OTP_EXPIRED             → code: "Mã đã hết hạn, bấm Gửi lại để nhận mã mới"
  OTP_NOT_FOUND           → identifier: "Chưa có yêu cầu reset mật khẩu cho tài khoản này" + link /auth/reset-password
  OTP_ALREADY_CONSUMED    → form: "Mã đã được sử dụng." + link /auth/reset-password
  OTP_BLOCKED             → form: "Tạm khoá do nhập sai / gửi lại quá nhiều, thử lại sau <blockUntil>"
  400 validation          → applyServerErrors

Open questions: none (defaults above — sửa nếu khác ý)
