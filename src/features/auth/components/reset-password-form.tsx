"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Input } from "@/shared/components/atoms";
import { FormField } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { cn } from "@/shared/lib/utils";
import { IDENTIFIER_LABELS, RESET_PASSWORD_ERROR_FIELDS } from "../constants/auth.constants";
import { useAuthHandoff } from "../hooks/use-auth-handoff";
import { useRequestPasswordReset } from "../hooks/use-request-password-reset";
import { resetPasswordSchema } from "../schemas/reset-password.schema";
import type { TLoginType, TRequestPasswordResetInput } from "../types/auth.types";
import { formatBlockUntil, getIssuedAt } from "../utils/otp.util";
import { LoginTypeTabs } from "./login-type-tabs";

const DEFAULT_VALUES: TRequestPasswordResetInput = { loginType: "EMAIL", identifier: "" };

type TResetPasswordErrorCode = keyof typeof RESET_PASSWORD_ERROR_FIELDS;

const isKnownResetPasswordError = (code: string): code is TResetPasswordErrorCode =>
  code in RESET_PASSWORD_ERROR_FIELDS;

export type TResetPasswordFormProps = { className?: string };

/**
 * Form yêu cầu reset mật khẩu (ui-ux.md §4): gửi code RESET_PASSWORD rồi sang /auth/change-password.
 * Code cũ còn hạn (OTP_ALREADY_REQUESTED) → vẫn chuyển trang, countdown resend tính từ lúc code cũ được gửi.
 */
export function ResetPasswordForm({ className }: TResetPasswordFormProps) {
  const router = useRouter();
  const handoff = useAuthHandoff("reset-password");
  const registerHandoff = useAuthHandoff("register");
  const resetMutation = useRequestPasswordReset();
  const form = useAppForm<TRequestPasswordResetInput>({ schema: resetPasswordSchema, defaultValues: DEFAULT_VALUES });
  const { errors } = form.formState;
  // OTP_ALREADY_REQUESTED cũng chuyển trang (qua onError) → không dựa được vào isSuccess.
  const [isRedirecting, setIsRedirecting] = useState(false);

  const loginType = form.watch("loginType");

  useEffect(() => {
    form.setFocus("identifier");
  }, [form]);

  const changeLoginType = (nextType: TLoginType) => {
    form.reset({ ...DEFAULT_VALUES, loginType: nextType });
    form.setFocus("identifier");
  };

  /** Sang trang kích hoạt với identifier đang nhập; `at = 0` → hết cooldown, được gửi lại code ngay. */
  const goToActivate = () => {
    const { loginType: currentLoginType, identifier } = form.getValues();
    registerHandoff.save({ loginType: currentLoginType, identifier: identifier.trim() }, 0);
  };

  const onSubmit = form.handleSubmit((input) => {
    const goToChangePassword = (requestedAt: number) => {
      setIsRedirecting(true);
      handoff.save({ loginType: input.loginType, identifier: input.identifier }, requestedAt);
      router.push(ROUTES.auth.changePassword);
    };

    resetMutation.mutate(input, {
      onSuccess: () => goToChangePassword(Date.now()),
      onError: (error) => {
        if (isAppError(error) && error.code === "OTP_ALREADY_REQUESTED") {
          goToChangePassword(getIssuedAt(error.details) ?? Date.now());
          return;
        }
        if (!isAppError(error) || !isKnownResetPasswordError(error.code)) {
          applyServerErrors(form, error);
          return;
        }
        const { field, message } = RESET_PASSWORD_ERROR_FIELDS[error.code];
        if (field === "root") {
          const until = error.code === "OTP_BLOCKED" ? formatBlockUntil(error.details) : null;
          form.setError(FORM_ROOT_ERROR, {
            type: error.code,
            message: until ? `${message} Thử lại sau ${until}.` : message,
          });
          return;
        }
        form.setError(field, { type: "server", message });
        // Chờ fieldset hết disabled (isPending → false) rồi mới focus được.
        requestAnimationFrame(() => form.setFocus(field));
      },
    });
  });

  // Giữ trạng thái khoá form cho tới khi chuyển trang xong (tránh bấm RESET lần 2).
  const isSubmitting = resetMutation.isPending || isRedirecting;
  const rootError = errors.root?.server;

  return (
    <form onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-4", className)}>
      <LoginTypeTabs value={loginType} onValueChange={changeLoginType} disabled={isSubmitting} />

      <fieldset disabled={isSubmitting} className="flex min-w-0 flex-col gap-4">
        <FormField
          id="identifier"
          label={IDENTIFIER_LABELS[loginType]}
          description={`Mã đặt lại mật khẩu sẽ được gửi tới ${loginType === "EMAIL" ? "email" : "số điện thoại"} này`}
          error={errors.identifier?.message}
          required
        >
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
      </fieldset>

      <div className="flex flex-col gap-2">
        {rootError?.message && (
          <p className="text-center text-sm text-destructive" role="alert">
            {rootError.message}
            {rootError.type === "OTP_ACCOUNT_NOT_ACTIVE" && (
              <>
                {" "}
                <Link
                  href={ROUTES.auth.activate}
                  onClick={goToActivate}
                  className="font-medium underline underline-offset-4"
                >
                  Kích hoạt ngay
                </Link>
              </>
            )}
          </p>
        )}
        <Button type="submit" size="lg" className="mx-auto w-full max-w-60" loading={isSubmitting}>
          RESET
        </Button>
      </div>
    </form>
  );
}
