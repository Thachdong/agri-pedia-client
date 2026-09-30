"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AddressFields, type TAddressFieldsErrors, type TAddressFieldsValue } from "@/features/location";
import {
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/components/atoms";
import { FormField, PasswordInput } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { applyServerErrors, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { cn } from "@/shared/lib/utils";
import {
  BUSINESS_TYPE_OPTIONS,
  IDENTIFIER_LABELS,
  REGISTER_ERROR_FIELDS,
  ROLE_OPTIONS,
} from "../constants/auth.constants";
import { useAuthHandoff } from "../hooks/use-auth-handoff";
import { useRegister } from "../hooks/use-register";
import { registerSchema } from "../schemas/register.schema";
import type { TBusinessType, TLoginType, TRegisterFormValues, TUserRole } from "../types/auth.types";
import { toRegisterInput } from "../utils/register.util";
import { LoginTypeTabs } from "./login-type-tabs";

const DEFAULT_VALUES = {
  loginType: "EMAIL",
  identifier: "",
  password: "",
  confirmPassword: "",
  username: "",
  role: "FARMER",
  bussinessType: null,
  bio: "",
  address: { province: "", ward: "", houseNumber: "" },
} satisfies Partial<Omit<TRegisterFormValues, "address">> & { address: Partial<TRegisterFormValues["address"]> };

const ADDRESS_FIELDS = {
  province: ["address.province"],
  ward: ["address.ward"],
  houseNumber: ["address.houseNumber"],
  location: ["address.lat", "address.long"],
} as const;

const isKnownRegisterError = (code: string): code is keyof typeof REGISTER_ERROR_FIELDS => code in REGISTER_ERROR_FIELDS;

export type TRegisterFormProps = { className?: string };

/** Form đăng ký (ui-ux.md §1 mục (2)–(4)): phần field cuộn dọc, nút REGISTER cố định bên dưới. */
export function RegisterForm({ className }: TRegisterFormProps) {
  const router = useRouter();
  const handoff = useAuthHandoff("register");
  const loginHandoff = useAuthHandoff("login");
  const registerMutation = useRegister();
  const form = useAppForm<TRegisterFormValues>({ schema: registerSchema, defaultValues: DEFAULT_VALUES });
  const { errors, isSubmitted } = form.formState;

  const loginType = form.watch("loginType");
  const role = form.watch("role");
  const bussinessType = form.watch("bussinessType");
  const address = form.watch("address") as TAddressFieldsValue;

  useEffect(() => form.setFocus("identifier"), [form]);

  const changeLoginType = (next: TLoginType) => {
    form.setValue("loginType", next);
    form.resetField("identifier");
    form.setFocus("identifier");
  };

  const changeRole = (next: TUserRole) => {
    form.setValue("role", next, { shouldDirty: true });
    if (next === "FARMER") form.setValue("bussinessType", null);
    if (isSubmitted) void form.trigger("bussinessType");
  };

  const changeAddress = (patch: Partial<TAddressFieldsValue>) => {
    for (const [key, value] of Object.entries(patch) as [keyof TAddressFieldsValue, string | number][]) {
      form.setValue(`address.${key}`, value, { shouldDirty: true, shouldValidate: isSubmitted });
    }
    if ("lat" in patch) void form.trigger(ADDRESS_FIELDS.location);
  };

  const addressErrors: TAddressFieldsErrors = {
    province: errors.address?.province?.message,
    ward: errors.address?.ward?.message,
    houseNumber: errors.address?.houseNumber?.message,
    location: errors.address?.lat?.message ?? errors.address?.long?.message,
  };

  const onSubmit = form.handleSubmit((values) => {
    const input = toRegisterInput(values);
    registerMutation.mutate(input, {
      onSuccess: () => {
        if (input.role === "DISTRIBUTOR") {
          handoff.save({ loginType: input.loginType, identifier: input.identifier });
          router.push(ROUTES.auth.activate);
        } else {
          loginHandoff.save({ loginType: input.loginType, identifier: input.identifier });
          router.push(ROUTES.auth.login);
        }
      },
      onError: (error) => {
        if (isAppError(error) && isKnownRegisterError(error.code)) {
          const { field, message } = REGISTER_ERROR_FIELDS[error.code];
          form.setError(field, { type: "server", message }, { shouldFocus: true });
          return;
        }
        applyServerErrors(form, error);
      },
    });
  });

  const isSubmitting = registerMutation.isPending;
  const rootError = errors.root?.server?.message;

  return (
    <form onSubmit={onSubmit} noValidate className={cn("flex min-h-0 flex-1 flex-col gap-4", className)}>
      <LoginTypeTabs value={loginType} onValueChange={changeLoginType} disabled={isSubmitting} />

      {/* Vùng cuộn phải là div: fieldset không co theo min-h-0/overflow trong flex (Chrome). */}
      <div className="scrollbar-thin -mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-1">
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

          <FormField id="password" label="Mật khẩu" description="8–128 ký tự" error={errors.password?.message} required>
            {(control) => <PasswordInput {...control} {...form.register("password")} autoComplete="new-password" />}
          </FormField>

          <FormField id="confirmPassword" label="Xác nhận mật khẩu" error={errors.confirmPassword?.message} required>
            {(control) => (
              <PasswordInput {...control} {...form.register("confirmPassword")} autoComplete="new-password" />
            )}
          </FormField>

          <FormField
            id="username"
            label="Tên hiển thị"
            description="Bỏ trống sẽ dùng email/số điện thoại"
            error={errors.username?.message}
          >
            {(control) => <Input {...control} {...form.register("username")} autoComplete="nickname" maxLength={100} />}
          </FormField>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">
              Bạn là
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </legend>
            <RadioGroup
              value={role}
              onValueChange={(next) => changeRole(next as TUserRole)}
              className="grid-cols-1 sm:grid-cols-2"
            >
              {ROLE_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`role-${option.value}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-data-checked:border-primary has-data-checked:bg-surface"
                >
                  <RadioGroupItem id={`role-${option.value}`} value={option.value} className="mt-0.5" />
                  <span className="flex flex-col gap-0.5">
                    <span>{option.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">{option.description}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          {role === "DISTRIBUTOR" && (
            <FormField id="bussinessType" label="Loại hình kinh doanh" error={errors.bussinessType?.message} required>
              {(control) => (
                <Select
                  value={bussinessType ?? ""}
                  onValueChange={(next) =>
                    form.setValue("bussinessType", next as TBusinessType, { shouldDirty: true, shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full" {...control}>
                    <SelectValue placeholder="Chọn loại hình kinh doanh" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {BUSINESS_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          )}

          <FormField id="bio" label="Giới thiệu" error={errors.bio?.message}>
            {(control) => <Textarea {...control} {...form.register("bio")} rows={3} maxLength={1000} />}
          </FormField>

          <AddressFields
            idPrefix="address"
            value={address}
            onChange={changeAddress}
            onBlur={(field) => void form.trigger(ADDRESS_FIELDS[field])}
            errors={addressErrors}
            disabled={isSubmitting}
          />
        </fieldset>
      </div>

      <div className="flex flex-col gap-2">
        {rootError && (
          <p className="text-center text-sm text-destructive" role="alert">
            {rootError}
          </p>
        )}
        <Button type="submit" size="lg" className="mx-auto w-full max-w-60" loading={isSubmitting}>
          REGISTER
        </Button>
      </div>
    </form>
  );
}
