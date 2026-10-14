"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button, Input } from "@/shared/components/atoms";
import { FormField, OtpCodeInput, PasswordInput } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { useCountdown } from "@/shared/hooks";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { cn } from "@/shared/lib/utils";
import {
  CHANGE_PASSWORD_ERROR_FIELDS,
  IDENTIFIER_LABELS,
  OTP_CODE_LENGTH,
  RESEND_CODE_COOLDOWN_MS,
} from "../constants/auth.constants";
import { useAuthHandoff } from "../hooks/use-auth-handoff";
import { useConfirmPasswordReset } from "../hooks/use-confirm-password-reset";
import { useResendCode } from "../hooks/use-resend-code";
import { changePasswordSchema } from "../schemas/change-password.schema";
import type { TChangePasswordFormValues, TLoginType } from "../types/auth.types";
import { formatBlockUntil } from "../utils/otp.util";
import { LoginTypeTabs } from "./login-type-tabs";
import { ResendCodeAction } from "./resend-code-action";

const DEFAULT_VALUES: TChangePasswordFormValues = {
  loginType: "EMAIL",
  identifier: "",
  newPassword: "",
  confirmPassword: "",
  code: "",
};

type TChangePasswordErrorCode = keyof typeof CHANGE_PASSWORD_ERROR_FIELDS;

const isKnownChangePasswordError = (code: string): code is TChangePasswordErrorCode =>
  code in CHANGE_PASSWORD_ERROR_FIELDS;

/** Lỗi cần gửi lại yêu cầu reset → hiện link sang /auth/reset-password. */
const NEEDS_NEW_REQUEST: readonly string[] = ["OTP_NOT_FOUND", "OTP_ALREADY_CONSUMED"];

export type TChangePasswordFormProps = { className?: string };

/**
 * Form đặt mật khẩu mới bằng code RESET_PASSWORD (ui-ux.md §5).
 * Có handoff từ /auth/reset-password → điền sẵn identifier, focus Password, countdown tính từ lúc gửi code.
 * Không có handoff → EMAIL, focus identifier, được gửi lại code ngay.
 */
export function ChangePasswordForm({ className }: TChangePasswordFormProps) {
  const router = useRouter();
  const handoff = useAuthHandoff("reset-password");
  const loginHandoff = useAuthHandoff("login");
  const confirmMutation = useConfirmPasswordReset();
  const resendMutation = useResendCode("RESET_PASSWORD");
  const countdown = useCountdown();
  const submitRef = useRef<HTMLButtonElement>(null);
  const form = useAppForm<TChangePasswordFormValues>({ schema: changePasswordSchema, defaultValues: DEFAULT_VALUES });
  const { errors, isSubmitted } = form.formState;

  const loginType = form.watch("loginType");
  const code = form.watch("code");
  const { ref: codeRef } = form.register("code");

  const { start: startCountdown } = countdown;
  useEffect(() => {
    const data = handoff.read();
    if (!data) {
      form.setFocus("identifier");
      return;
    }
    form.reset({ ...DEFAULT_VALUES, loginType: data.loginType, identifier: data.identifier });
    startCountdown(data.at + RESEND_CODE_COOLDOWN_MS);
    requestAnimationFrame(() => form.setFocus("newPassword"));
  }, [form, handoff, startCountdown]);

  const showDomainError = (error: unknown) => {
    if (!isAppError(error) || !isKnownChangePasswordError(error.code)) {
      applyServerErrors(form, error);
      return;
    }
    const { field, message } = CHANGE_PASSWORD_ERROR_FIELDS[error.code];
    if (field === "root") {
      const until = error.code === "OTP_BLOCKED" ? formatBlockUntil(error.details) : null;
      form.setError(FORM_ROOT_ERROR, {
        type: error.code,
        message: until ? `${message} Thử lại sau ${until}.` : message,
      });
      return;
    }
    // Giữ nguyên code / mật khẩu đã nhập để user sửa đúng chỗ sai.
    // `type` = mã lỗi: OTP_NOT_FOUND ở identifier cần hiện link gửi yêu cầu reset mới.
    form.setError(field, { type: error.code, message }, { shouldFocus: true });
  };

  const changeLoginType = (next: TLoginType) => {
    form.reset({ ...DEFAULT_VALUES, loginType: next });
    countdown.stop();
    form.setFocus("identifier");
  };

  const changeCode = (next: string) => {
    form.setValue("code", next, { shouldDirty: true, shouldValidate: isSubmitted });
  };

  const resend = async () => {
    form.clearErrors(FORM_ROOT_ERROR);
    const isIdentifierValid = await form.trigger("identifier", { shouldFocus: true });
    if (!isIdentifierValid) return;

    const { loginType: currentLoginType, identifier } = form.getValues();
    resendMutation.mutate(
      { identifier: identifier.trim() },
      {
        onSuccess: () => {
          const now = Date.now();
          handoff.save({ loginType: currentLoginType, identifier: identifier.trim() }, now);
          countdown.start(now + RESEND_CODE_COOLDOWN_MS);
          form.clearErrors("code");
          form.setValue("code", "");
          form.setFocus("code");
        },
        onError: showDomainError,
      },
    );
  };

  const onSubmit = form.handleSubmit(({ loginType: currentLoginType, identifier, newPassword, code: value }) => {
    confirmMutation.mutate(
      { identifier, code: value, newPassword },
      {
        onSuccess: () => {
          handoff.clear();
          loginHandoff.save({ loginType: currentLoginType, identifier });
          router.push(ROUTES.auth.login);
        },
        onError: showDomainError,
      },
    );
  });

  // Giữ trạng thái khoá form cho tới khi chuyển trang xong (tránh gửi lại code đã dùng).
  const isSubmitting = confirmMutation.isPending || confirmMutation.isSuccess;
  const rootError = errors.root?.server;
  const needsNewRequest =
    NEEDS_NEW_REQUEST.includes(String(rootError?.type)) || NEEDS_NEW_REQUEST.includes(String(errors.identifier?.type));

  return (
    <form onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-4", className)}>
      <LoginTypeTabs value={loginType} onValueChange={changeLoginType} disabled={isSubmitting} />

      <fieldset disabled={isSubmitting} className="flex min-w-0 flex-col gap-4">
        <FormField id="identifier" label={IDENTIFIER_LABELS[loginType]} error={errors.identifier?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register("identifier")}
              type={loginType === "EMAIL" ? "email" : "tel"}
              inputMode={loginType === "EMAIL" ? "email" : "tel"}
              autoComplete="username"
              placeholder={loginType === "EMAIL" ? "ban@example.com" : "0901 234 567"}
            />
          )}
        </FormField>

        <FormField id="newPassword" label="Mật khẩu mới" error={errors.newPassword?.message} required>
          {(control) => (
            <PasswordInput {...control} {...form.register("newPassword")} autoComplete="new-password" />
          )}
        </FormField>

        <FormField id="confirmPassword" label="Xác nhận mật khẩu" error={errors.confirmPassword?.message} required>
          {(control) => (
            <PasswordInput {...control} {...form.register("confirmPassword")} autoComplete="new-password" />
          )}
        </FormField>

        <FormField
          id="code"
          label="Mã xác nhận"
          description={`Mã ${OTP_CODE_LENGTH} chữ số đã gửi tới ${loginType === "EMAIL" ? "email" : "số điện thoại"} của bạn`}
          error={errors.code?.message}
          required
        >
          {(control) => (
            <OtpCodeInput
              {...control}
              ref={codeRef}
              name="code"
              length={OTP_CODE_LENGTH}
              value={code}
              onChange={changeCode}
              onComplete={() => submitRef.current?.focus()}
              disabled={isSubmitting}
            />
          )}
        </FormField>

        <ResendCodeAction
          remainingSeconds={countdown.remainingSeconds}
          pending={resendMutation.isPending}
          disabled={isSubmitting}
          onResend={() => void resend()}
        />
      </fieldset>

      <div className="flex flex-col gap-2">
        {(rootError?.message || needsNewRequest) && (
          <p className="text-center text-sm text-destructive" role="alert">
            {rootError?.message}
            {needsNewRequest && (
              <>
                {" "}
                <Link href={ROUTES.auth.resetPassword} className="font-medium underline underline-offset-4">
                  Gửi yêu cầu reset mới
                </Link>
              </>
            )}
          </p>
        )}
        <Button ref={submitRef} type="submit" size="lg" className="mx-auto w-full max-w-60" loading={isSubmitting}>
          CHANGE PASSWORD
        </Button>
      </div>
    </form>
  );
}
