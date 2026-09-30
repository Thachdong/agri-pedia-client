"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button, Input } from "@/shared/components/atoms";
import { FormField, OtpCodeInput } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { useCountdown } from "@/shared/hooks";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { cn } from "@/shared/lib/utils";
import {
  ACTIVATE_ERROR_FIELDS,
  IDENTIFIER_LABELS,
  OTP_CODE_LENGTH,
  RESEND_CODE_COOLDOWN_MS,
} from "../constants/auth.constants";
import { useActivate } from "../hooks/use-activate";
import { useAuthHandoff } from "../hooks/use-auth-handoff";
import { useResendCode } from "../hooks/use-resend-code";
import { activateSchema } from "../schemas/activate.schema";
import type { TActivateFormValues, TLoginType } from "../types/auth.types";
import { LoginTypeTabs } from "./login-type-tabs";
import { ResendCodeAction } from "./resend-code-action";

const DEFAULT_VALUES: TActivateFormValues = { loginType: "EMAIL", identifier: "", code: "" };

type TActivateErrorCode = keyof typeof ACTIVATE_ERROR_FIELDS;

const isKnownActivateError = (code: string): code is TActivateErrorCode => code in ACTIVATE_ERROR_FIELDS;

/** `details.blockUntil` (ISO) của OTP_BLOCKED → "HH:mm"; không có / sai định dạng → null. */
const formatBlockUntil = (details: unknown) => {
  const blockUntil = (details as { blockUntil?: unknown } | undefined)?.blockUntil;
  if (typeof blockUntil !== "string") return null;
  const date = new Date(blockUntil);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

export type TActivateFormProps = { className?: string };

/**
 * Form kích hoạt tài khoản DISTRIBUTOR (ui-ux.md §2).
 * Có handoff từ /auth/register → điền sẵn identifier, focus ô code, countdown tính từ lúc đăng ký.
 * Không có handoff → EMAIL, focus identifier, được gửi lại code ngay.
 */
export function ActivateForm({ className }: TActivateFormProps) {
  const router = useRouter();
  const handoff = useAuthHandoff("register");
  const activateMutation = useActivate();
  const resendMutation = useResendCode("ACTIVATE_DISTRIBUTOR");
  const countdown = useCountdown();
  const submitRef = useRef<HTMLButtonElement>(null);
  const form = useAppForm<TActivateFormValues>({ schema: activateSchema, defaultValues: DEFAULT_VALUES });
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
    // Chờ ô code (input ẩn của OtpCodeInput) nhận giá trị reset rồi mới focus.
    requestAnimationFrame(() => form.setFocus("code"));
  }, [form, handoff, startCountdown]);

  const showDomainError = (error: unknown) => {
    if (!isAppError(error) || !isKnownActivateError(error.code)) {
      applyServerErrors(form, error);
      return;
    }
    const { field, message } = ACTIVATE_ERROR_FIELDS[error.code];
    if (field === "root") {
      const until = error.code === "OTP_BLOCKED" ? formatBlockUntil(error.details) : null;
      form.setError(FORM_ROOT_ERROR, {
        type: error.code,
        message: until ? `${message} Thử lại sau ${until}.` : message,
      });
      return;
    }
    // Giữ nguyên code đã nhập để user thấy và sửa từng số.
    form.setError(field, { type: "server", message }, { shouldFocus: true });
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

  const onSubmit = form.handleSubmit(({ identifier, code: value }) => {
    activateMutation.mutate(
      { identifier, code: value },
      {
        onSuccess: () => {
          handoff.clear();
          router.push(ROUTES.auth.login);
        },
        onError: showDomainError,
      },
    );
  });

  const isSubmitting = activateMutation.isPending;
  const rootError = errors.root?.server;

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
              autoComplete={loginType === "EMAIL" ? "email" : "tel"}
              placeholder={loginType === "EMAIL" ? "ban@example.com" : "0901 234 567"}
            />
          )}
        </FormField>

        <FormField
          id="code"
          label="Mã kích hoạt"
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
        {rootError?.message && (
          <p className="text-center text-sm text-destructive" role="alert">
            {rootError.message}
            {rootError.type === "OTP_ALREADY_CONSUMED" && (
              <>
                {" "}
                <Link href={ROUTES.auth.login} className="font-medium underline underline-offset-4">
                  Đăng nhập
                </Link>
              </>
            )}
          </p>
        )}
        <Button ref={submitRef} type="submit" size="lg" className="mx-auto w-full max-w-60" loading={isSubmitting}>
          ACTIVATE
        </Button>
      </div>
    </form>
  );
}
