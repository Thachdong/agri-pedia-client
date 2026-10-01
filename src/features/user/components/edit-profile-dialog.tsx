"use client";

import { getFileExtension, MEDIA_ALLOWED_EXTENSIONS, type TMediaType, useUploadMedia } from "@/features/media";
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/components/atoms";
import { FileInputField, FormField } from "@/shared/components/molecules";
import { BUSINESS_TYPE_OPTIONS } from "@/shared/constants";
import { applyServerErrors, useAppForm } from "@/shared/lib/form";
import type { TBusinessType } from "@/shared/types";
import { useMe } from "../hooks/use-me";
import { useUpdateMe } from "../hooks/use-update-me";
import { updateProfileSchema } from "../schemas/update-profile.schema";
import type { TUpdateProfileFormValues, TUpdateProfileInput, TUserProfile } from "../types/user.types";

export type TEditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Loại media profile dùng — avatar luôn IMAGE, giấy phép IMAGE | FILE. */
type TProfileMediaType = Extract<TMediaType, "IMAGE" | "FILE">;

const FORM_ID = "edit-profile-form";
const BIO_MAX = 1000;
const toAccept = (extensions: readonly string[]) => extensions.map((extension) => `.${extension}`).join(",");
const AVATAR_ACCEPT = toAccept(MEDIA_ALLOWED_EXTENSIONS.IMAGE);
const LICENSE_ACCEPT = toAccept([...MEDIA_ALLOWED_EXTENSIONS.IMAGE, ...MEDIA_ALLOWED_EXTENSIONS.FILE]);

/** Giấy phép là pdf → FILE, còn lại (ảnh) → IMAGE — đúng loại server dùng để kiểm tra đuôi. */
const licenseMediaType = (file: File): TProfileMediaType =>
  (MEDIA_ALLOWED_EXTENSIONS.FILE as readonly string[]).includes(getFileExtension(file.name)) ? "FILE" : "IMAGE";

/**
 * M6 — sửa hồ sơ của chính mình (ui-ux.md §7, DISTRIBUTOR): username, avatar, bio, lĩnh vực, giấy phép.
 * Submit: upload file mới (nếu có) lên TMP → PATCH /users/me với key vừa nhận.
 */
export function EditProfileDialog({ open, onOpenChange }: TEditProfileDialogProps) {
  const { data: me } = useMe();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
          <DialogDescription>Thông tin hiển thị trên trang profile của bạn.</DialogDescription>
        </DialogHeader>
        {/* Content unmount khi đóng → mỗi lần mở form lấy lại giá trị mới nhất từ `me`. */}
        {me && <EditProfileForm me={me} onDone={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

type TEditProfileFormProps = { me: TUserProfile; onDone: () => void; onCancel: () => void };

function EditProfileForm({ me, onDone, onCancel }: TEditProfileFormProps) {
  const upload = useUploadMedia<TProfileMediaType>();
  const updateMe = useUpdateMe(me.id);
  const form = useAppForm<TUpdateProfileFormValues>({
    schema: updateProfileSchema,
    defaultValues: {
      username: me.username,
      bio: me.bio ?? "",
      // Chưa có (dữ liệu cũ) → để trống, schema bắt chọn.
      bussinessType: me.bussinessType ?? ("" as TBusinessType),
      avatar: null,
      bussinessLicense: null,
    },
  });
  const { errors, isSubmitted, isSubmitting } = form.formState;
  const avatar = form.watch("avatar");
  const license = form.watch("bussinessLicense");
  const bussinessType = form.watch("bussinessType");
  const bioLength = form.watch("bio").length;
  const username = form.watch("username");

  const setFile = (field: "avatar" | "bussinessLicense", file: File | null) =>
    form.setValue(field, file, { shouldDirty: true, shouldValidate: true });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const files = [
        values.avatar && { field: "avatar" as const, file: values.avatar, type: "IMAGE" as const },
        values.bussinessLicense && {
          field: "bussinessLicense" as const,
          file: values.bussinessLicense,
          type: licenseMediaType(values.bussinessLicense),
        },
      ].filter((item) => !!item);
      const uploaded = files.length > 0 ? await upload.mutateAsync(files) : [];

      const input: TUpdateProfileInput = { username: values.username, bio: values.bio, bussinessType: values.bussinessType };
      files.forEach(({ field }, index) => {
        const media = uploaded[index];
        if (field === "avatar") input.avatar = { ...media, type: "IMAGE" };
        else input.bussinessLicense = media;
      });

      await updateMe.mutateAsync(input);
      onDone();
    } catch (error) {
      applyServerErrors(form, error);
    }
  });

  const rootError = errors.root?.server?.message;

  return (
    <>
      <form
        id={FORM_ID}
        onSubmit={onSubmit}
        noValidate
        className="scrollbar-thin -mx-1 flex min-h-0 flex-col gap-4 overflow-y-auto px-1"
      >
        <FormField id="profile-username" label="Tên hiển thị" required error={errors.username?.message}>
          {(control) => <Input {...control} {...form.register("username")} autoComplete="nickname" disabled={isSubmitting} />}
        </FormField>

        <FormField
          id="profile-avatar"
          label="Ảnh đại diện"
          error={errors.avatar?.message}
          description="JPG, PNG hoặc WEBP, tối đa 10MB."
        >
          {(control) => (
            <FileInputField
              {...control}
              value={avatar}
              onChange={(file) => setFile("avatar", file)}
              accept={AVATAR_ACCEPT}
              disabled={isSubmitting}
              buttonLabel="Chọn ảnh"
              placeholder={
                <span className="flex items-center gap-2">
                  <Avatar name={username || me.username} size="sm" />
                  {me.avatar ? "Giữ ảnh hiện tại" : "Chưa có ảnh đại diện"}
                </span>
              }
            />
          )}
        </FormField>

        <FormField id="profile-business-type" label="Lĩnh vực kinh doanh" required error={errors.bussinessType?.message}>
          {(control) => (
            <Select
              value={bussinessType}
              onValueChange={(next) =>
                form.setValue("bussinessType", next as TBusinessType, { shouldDirty: true, shouldValidate: isSubmitted })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full" {...control}>
                <SelectValue placeholder="Chọn lĩnh vực kinh doanh" />
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

        <FormField
          id="profile-license"
          label="Giấy phép kinh doanh"
          error={errors.bussinessLicense?.message}
          description="Ảnh (JPG, PNG, WEBP) hoặc PDF, tối đa 10MB."
        >
          {(control) => (
            <FileInputField
              {...control}
              value={license}
              onChange={(file) => setFile("bussinessLicense", file)}
              accept={LICENSE_ACCEPT}
              disabled={isSubmitting}
              placeholder={
                me.bussinessLicense ? (
                  <a
                    href={me.bussinessLicense}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-highlight underline-offset-4 hover:underline"
                  >
                    Xem giấy phép hiện tại
                  </a>
                ) : (
                  "Chưa có giấy phép"
                )
              }
            />
          )}
        </FormField>

        <FormField
          id="profile-bio"
          label="Giới thiệu"
          error={errors.bio?.message}
          description={`${bioLength}/${BIO_MAX} ký tự`}
        >
          {(control) => (
            <Textarea
              {...control}
              {...form.register("bio")}
              rows={5}
              maxLength={BIO_MAX}
              placeholder="Sản phẩm, kinh nghiệm, khu vực phục vụ…"
              disabled={isSubmitting}
              className="resize-none"
            />
          )}
        </FormField>

        {rootError && (
          <p role="alert" className="text-sm text-destructive">
            {rootError}
          </p>
        )}
      </form>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Huỷ
        </Button>
        <Button type="submit" form={FORM_ID} loading={isSubmitting}>
          {upload.isPending ? "Đang tải file…" : "Lưu thay đổi"}
        </Button>
      </DialogFooter>
    </>
  );
}
