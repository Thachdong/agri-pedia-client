"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, Input } from "@/shared/components/atoms";
import { FormField, PasswordInput } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { cn } from "@/shared/lib/utils";
import { IDENTIFIER_LABELS, LOGIN_ERROR_MESSAGES } from "../constants/auth.constants";
import { useAuthHandoff } from "../hooks/use-auth-handoff";
import { useLogin } from "../hooks/use-login";
import { loginSchema } from "../schemas/login.schema";
import type { TLoginInput, TLoginType } from "../types/auth.types";
import { getPostLoginPath } from "../utils/login.util";
import { LoginTypeTabs } from "./login-type-tabs";

const DEFAULT_VALUES: TLoginInput = { loginType: "EMAIL", identifier: "", password: "" };

type TLoginErrorCode = keyof typeof LOGIN_ERROR_MESSAGES;

const isKnownLoginError = (code: string): code is TLoginErrorCode => code in LOGIN_ERROR_MESSAGES;

export type TLoginFormProps = {
  /** Giá trị thô của `?next=` — form tự lọc qua getPostLoginPath, không có / không hợp lệ → điều hướng theo role. */
  next?: string;
  className?: string;
};

/**
 * Form đăng nhập (ui-ux.md §3).
 * Có handoff "login" (sau đăng ký FARMER / kích hoạt) → điền sẵn loginType + identifier, focus password.
 * Không có → EMAIL, focus identifier.
 */
export function LoginForm({ next, className }: TLoginFormProps) {
  const router = useRouter();
  const loginHandoff = useAuthHandoff("login");
  const registerHandoff = useAuthHandoff("register");
  const loginMutation = useLogin();
  const form = useAppForm<TLoginInput>({ schema: loginSchema, defaultValues: DEFAULT_VALUES });
  const { errors } = form.formState;

  const loginType = form.watch("loginType");

  useEffect(() => {
    const data = loginHandoff.read();
    if (!data) {
      form.setFocus("identifier");
      return;
    }
    form.reset({ ...DEFAULT_VALUES, loginType: data.loginType, identifier: data.identifier });
    requestAnimationFrame(() => form.setFocus("password"));
  }, [form, loginHandoff]);

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
    loginMutation.mutate(input, {
      onSuccess: ({ user }) => {
        loginHandoff.clear();
        router.replace(getPostLoginPath(user, next));
        // Server Components đọc lại cookie phiên mới.
        router.refresh();
      },
      onError: (error) => {
        if (!isAppError(error) || !isKnownLoginError(error.code)) {
          applyServerErrors(form, error);
          return;
        }
        form.setError(FORM_ROOT_ERROR, { type: error.code, message: LOGIN_ERROR_MESSAGES[error.code] });
        if (error.code === "USER_INVALID_CREDENTIALS") {
          form.setValue("password", "");
          // Chờ fieldset hết disabled (isPending → false) rồi mới focus được.
          requestAnimationFrame(() => form.setFocus("password"));
        }
      },
    });
  });

  // Giữ trạng thái khoá form cho tới khi chuyển trang xong (tránh bấm LOGIN lần 2).
  const isSubmitting = loginMutation.isPending || loginMutation.isSuccess;
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
              autoComplete="username"
              placeholder={loginType === "EMAIL" ? "ban@example.com" : "0901 234 567"}
            />
          )}
        </FormField>

        <FormField id="password" label="Mật khẩu" error={errors.password?.message} required>
          {(control) => (
            <PasswordInput {...control} {...form.register("password")} autoComplete="current-password" />
          )}
        </FormField>
      </fieldset>

      <div className="flex flex-col gap-2">
        {rootError?.message && (
          <p className="text-center text-sm text-destructive" role="alert">
            {rootError.message}
            {rootError.type === "USER_NOT_ACTIVE" && (
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
          LOGIN
        </Button>
      </div>
    </form>
  );
}
