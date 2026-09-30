Feature: auth-activate | Page: /auth/activate
Wireframe: specs/ui-ux/image-1.png (specs/ui-ux/ui-ux.md §2)
API: POST /auth/activate, POST /auth/resend (purpose ACTIVATE_DISTRIBUTOR)
Decisions: OTP 6 số (server OTP_LENGTH default 6, constant client) | resend cooldown 3 phút (ui-ux.md; wireframe 04:55 chỉ minh hoạ) | activate thành công → clear handoff + redirect /auth/login | resend thành công → lưu lại handoff với at = now (reload vẫn giữ countdown) | không có handoff → resend enabled ngay khi vào page, ẩn countdown (chỉ cần identifier hợp lệ)
Foundation: data-wrapper ✓ bff-forward ✓ (/auth/activate, /auth/resend forward qua catch-all) tokens ✓ arch-lint ✓ | bff-auth: /auth/activate chưa guest-only

- [x] 1. [bff-auth]              thêm /auth/activate vào GUEST_ONLY_PATHS
- [x] 2. [feature-api]           POST /auth/activate → TActivateInput, activate, useActivate (không invalidate)
- [x] 3. [feature-api]           POST /auth/resend → TResendCodeInput, resendCode, useResendCode (purpose truyền vào — tái dùng cho change-password)
- [x] 4. [validation-schema]     activateSchema — loginType, identifier theo loginType (email|phone), code đúng OTP_CODE_LENGTH chữ số
- [x] 5. [shared-unit]           hook useCountdown (shared) — start(untilMs), remainingSeconds, isRunning
- [x] 6. [atomic-component]      atom      InputOTP           (new, shared/ui)   shadcn generate (package input-otp): paste, autocomplete one-time-code, auto nhảy ô
- [x] 7. [atomic-component]      molecule  OtpCodeInput       (new, shared)      InputOTP N ô, chỉ số, onComplete (để focus button), autoFocus, aria-invalid
- [ ] 8. [atomic-component]      molecule  ResendCodeAction   (new, feature auth) "Chưa nhận được code? resend" + countdown mm:ss, disabled khi đếm/pending
- [ ] 9. [atomic-component]      organism  ActivateForm       (new, feature auth) init từ handoff (loginType+identifier, focus code | default EMAIL, focus identifier), countdown theo `at`, resend (validate identifier trước), map lỗi OTP_* → field/form, thành công → clear handoff + /auth/login
- [ ] 10. [page]                 /auth/activate ← AuthLayout + AuthHeader + ActivateForm + AuthFooterLinks(register, login, resetPassword); metadata; loading/error
- [ ] 11. [arch-review]

Components (in order):
  [atom]      InputOTP          new    shared (shadcn)
  [atom]      Button, Input, Label, Tabs   reuse  shared
  [molecule]  FormField         reuse  shared
  [molecule]  OtpCodeInput      new    shared
  [molecule]  LoginTypeTabs     reuse  feature auth
  [molecule]  AuthFooterLinks   reuse  feature auth
  [molecule]  ResendCodeAction  new    feature auth
  [organism]  AuthHeader        reuse  feature auth
  [organism]  ActivateForm      new    feature auth
  [template]  AuthLayout        reuse  shared
  [page]      ActivatePage      new    app/(auth)/auth/activate

Error mapping (ActivateForm):
  OTP_INVALID_CODE      → code: "Mã không đúng"
  OTP_EXPIRED           → code: "Mã đã hết hạn, bấm resend để nhận mã mới"
  OTP_NOT_FOUND         → identifier: "Không tìm thấy mã kích hoạt cho tài khoản này"
  OTP_ALREADY_CONSUMED  → form: "Tài khoản đã được kích hoạt" + link đăng nhập
  OTP_BLOCKED           → form: "Tạm khoá do nhập sai / gửi lại quá nhiều, thử lại sau <blockUntil>" (resend có details.blockUntil)

Notes:
  - /auth/login chưa build → redirect sau activate sẽ 404 tới khi làm trang login.
  - Đổi loginType (tab) → clear identifier + code, reset countdown về trạng thái không-handoff.
