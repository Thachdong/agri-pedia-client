"use client";

import { getMediaAccept, useMediaUploads } from "@/features/media";
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
import type { TSchema } from "@/shared/lib/validation";
import type { TBusinessType } from "@/shared/types";
import { useMe } from "../hooks/use-me";
import { useUpdateMe } from "../hooks/use-update-me";
import { updateFarmerProfileSchema, updateProfileSchema } from "../schemas/update-profile.schema";
import type { TUpdateProfileFormValues, TUpdateProfileInput, TUserProfile } from "../types/user.types";

export type TEditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FORM_ID = "edit-profile-form";
const BIO_MAX = 1000;
/** Avatar luôn IMAGE; giấy phép là ảnh → IMAGE, pdf → FILE (loại server dùng để kiểm tra đuôi). */
const AVATAR_TYPES = ["IMAGE"] as const;
const LICENSE_TYPES = ["IMAGE", "FILE"] as const;
const AVATAR_ACCEPT = getMediaAccept(AVATAR_TYPES);
const LICENSE_ACCEPT = getMediaAccept(LICENSE_TYPES);

type TFileField = "avatar" | "bussinessLicense";

/**
 * M6 — sửa hồ sơ của chính mình (ui-ux.md §7): username, avatar, bio; DISTRIBUTOR thêm lĩnh vực, giấy phép.
 * Email / Phone chỉ xem. Địa chỉ quản lý ngay trên trang (ManageAddressesSection), không ở đây.
 * File upload lên TMP ngay khi chọn; submit (chờ upload xong) → PATCH /users/me với key đã nhận.
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

/**
 * FARMER: form chỉ có username / bio / avatar — defaultValues không có key của DISTRIBUTOR (joi chặn key lạ),
 * schema farmer là tập con nên ép kiểu về schema chung của form.
 */
const getFormOptions = (me: TUserProfile) =>
  me.role === "DISTRIBUTOR"
    ? {
        schema: updateProfileSchema,
        defaultValues: {
          username: me.username,
          bio: me.bio ?? "",
          // Chưa có (dữ liệu cũ) → để trống, schema bắt chọn.
          bussinessType: me.bussinessType ?? ("" as TBusinessType),
          avatar: null,
          bussinessLicense: null,
        },
      }
    : {
        schema: updateFarmerProfileSchema as unknown as TSchema<TUpdateProfileFormValues>,
        defaultValues: { username: me.username, bio: me.bio ?? "", avatar: null },
      };

function EditProfileForm({ me, onDone, onCancel }: TEditProfileFormProps) {
  const isDistributor = me.role === "DISTRIBUTOR";
  const updateMe = useUpdateMe(me.id);
  const form = useAppForm<TUpdateProfileFormValues>(getFormOptions(me));
  const { errors, isSubmitted, isSubmitting } = form.formState;
  const avatar = form.watch("avatar");
  const license = form.watch("bussinessLicense");
  const bussinessType = form.watch("bussinessType");
  const bioLength = form.watch("bio").length;
  const username = form.watch("username");

  const isUploading = avatar?.status === "uploading" || license?.status === "uploading";

  // Kết quả upload chỉ ghi vào field nếu item đó vẫn đang được chọn (đã đổi / bỏ file thì bỏ qua).
  const syncUpload = (field: TFileField, id: string, next: TUpdateProfileFormValues[TFileField]) => {
    if (form.getValues(field)?.id !== id) return;
    form.setValue(field, next, { shouldValidate: form.formState.isSubmitted });
  };
  const avatarUploads = useMediaUploads({
    types: AVATAR_TYPES,
    onUpdate: (upload) => syncUpload("avatar", upload.id, upload),
    onFail: (id) => syncUpload("avatar", id, null),
  });
  const licenseUploads = useMediaUploads({
    types: LICENSE_TYPES,
    onUpdate: (upload) => syncUpload("bussinessLicense", upload.id, upload),
    onFail: (id) => syncUpload("bussinessLicense", id, null),
  });

  const selectAvatar = (file: File) => {
    const [upload] = avatarUploads.start([file]);
    // File sai đã bị loại (toast) → giữ file đang chọn.
    if (!upload) return;
    const previous = form.getValues("avatar");
    if (previous) avatarUploads.cancel(previous.id);
    form.setValue("avatar", upload, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  };
  const selectLicense = (file: File) => {
    const [upload] = licenseUploads.start([file]);
    if (!upload) return;
    const previous = form.getValues("bussinessLicense");
    if (previous) licenseUploads.cancel(previous.id);
    form.setValue("bussinessLicense", upload, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  };
  const removeFile = (field: TFileField, cancel: (id: string) => void) => {
    const previous = form.getValues(field);
    if (previous) cancel(previous.id);
    form.setValue(field, null, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const input: TUpdateProfileInput = { username: values.username, bio: values.bio };
      if (isDistributor) input.bussinessType = values.bussinessType;
      // Schema đã bắt mọi file phải upload xong.
      if (values.avatar?.status === "done") input.avatar = values.avatar.media;
      if (isDistributor && values.bussinessLicense?.status === "done") input.bussinessLicense = values.bussinessLicense.media;

      await updateMe.mutateAsync(input);
      onDone();
    } catch (error) {
      applyServerErrors(form, error);
    }
  });

  const rootError = errors.root?.server?.message;
  const contactLabel = me.loginType === "PHONE" ? "Số điện thoại" : "Email";
  const contact = (me.loginType === "PHONE" ? me.phone : me.email) ?? me.email ?? me.phone ?? "";

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

        <FormField id="profile-contact" label={contactLabel} description="Dùng để đăng nhập, không thay đổi được.">
          {(control) => <Input {...control} value={contact} readOnly disabled />}
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
              onSelect={selectAvatar}
              onRemove={() => removeFile("avatar", avatarUploads.cancel)}
              accept={AVATAR_ACCEPT}
              disabled={isSubmitting}
              buttonLabel="Chọn ảnh"
              placeholder={
                <span className="flex items-center gap-2">
                  <Avatar src={me.avatar} name={username || me.username} size="sm" />
                  {me.avatar ? "Giữ ảnh hiện tại" : "Chưa có ảnh đại diện"}
                </span>
              }
            />
          )}
        </FormField>

        {isDistributor && (
          <>
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
                  onSelect={selectLicense}
                  onRemove={() => removeFile("bussinessLicense", licenseUploads.cancel)}
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
          </>
        )}

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
        <Button type="submit" form={FORM_ID} loading={isSubmitting} disabled={isUploading}>
          {isUploading ? "Đang tải file…" : "Lưu thay đổi"}
        </Button>
      </DialogFooter>
    </>
  );
}
