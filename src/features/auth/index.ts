// Public API của feature `auth`.
export { AuthFooterLinks, type TAuthFooterLinkKey } from "./components/auth-footer-links";
export { AuthHeader } from "./components/auth-header";
export { RegisterForm } from "./components/register-form";
export { useActivate } from "./hooks/use-activate";
export { useRegister } from "./hooks/use-register";
export { useResendCode } from "./hooks/use-resend-code";
export type {
  TActivateInput,
  TBusinessType,
  TLoginType,
  TOtpPurpose,
  TRegisterInput,
  TResendCodeInput,
  TUserRole,
} from "./types/auth.types";
