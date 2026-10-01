"use client";

import { getMediaAccept, useMediaUploads } from "@/features/media";
import {
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
import { FormField, MultiImageInput } from "@/shared/components/molecules";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import {
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_ERROR_CODE,
  PRODUCT_ERROR_MESSAGES,
  PRODUCT_MEDIA_MAX,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_UNIT_OPTIONS,
} from "../constants/product.constants";
import { useCategories } from "../hooks/use-categories";
import { useCreateProduct } from "../hooks/use-create-product";
import { useUpdateProduct } from "../hooks/use-update-product";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema";
import type { TProductDetail, TProductFormValues, TProductStatus, TProductUnit } from "../types/product.types";

export type TProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** id của owner (me.id) — list cần làm mới sau khi lưu. */
  distributorId: string;
  /** Có → sửa (M9, prefill từ chi tiết); không → tạo mới (M8). */
  product?: TProductDetail;
  /** Lưu thành công (dialog tự đóng). */
  onSaved?: (productId: string) => void;
};

const FORM_ID = "product-form";
const IMAGE_TYPES = ["IMAGE"] as const;
const IMAGE_ACCEPT = getMediaAccept(IMAGE_TYPES);

/** Lỗi domain gắn được vào 1 field cụ thể. */
const FIELD_ERRORS: Partial<Record<string, "price" | "quantity" | "categoryId">> = {
  [PRODUCT_ERROR_CODE.INVALID_PRICE]: "price",
  [PRODUCT_ERROR_CODE.INVALID_QUANTITY]: "quantity",
  [PRODUCT_ERROR_CODE.CATEGORY_NOT_FOUND]: "categoryId",
};

/** Ô số rỗng → null (schema báo "Vui lòng nhập…") thay vì NaN / 0. */
const toNumberOrNull = (value: unknown) => (value === "" || value === null ? null : Number(value));

/**
 * M8 / M9 — tạo / sửa sản phẩm của chính mình (ui-ux.md §7, owner).
 * Ảnh mới upload lên TMP ngay khi chọn; submit (chờ upload xong) → POST /products (media) hoặc PATCH /products/:id (addMedia + removeMediaIds).
 */
export function ProductFormDialog({ open, onOpenChange, distributorId, product, onSaved }: TProductFormDialogProps) {
  const editing = !!product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</DialogTitle>
          <DialogDescription>
            {editing ? "Cập nhật thông tin, trạng thái và ảnh của sản phẩm." : "Sản phẩm mới hiển thị ngay trên trang của bạn."}
          </DialogDescription>
        </DialogHeader>
        {/* Content unmount khi đóng → mỗi lần mở form lấy lại giá trị mới nhất. */}
        <ProductForm
          distributorId={distributorId}
          product={product}
          onDone={(productId) => {
            onOpenChange(false);
            onSaved?.(productId);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

type TProductFormProps = {
  distributorId: string;
  product?: TProductDetail;
  onDone: (productId: string) => void;
  onCancel: () => void;
};

function ProductForm({ distributorId, product, onDone, onCancel }: TProductFormProps) {
  const categories = useCategories();
  const createProduct = useCreateProduct(distributorId);
  const updateProduct = useUpdateProduct(distributorId);
  const form = useAppForm<TProductFormValues>({
    schema: product ? updateProductSchema : createProductSchema,
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? null,
      quantity: product?.quantity ?? null,
      categoryId: product?.categoryId ?? "",
      unit: product?.unit ?? "",
      status: product?.status ?? "ACTIVE",
      images: [],
      removeMediaIds: [],
    },
  });
  const { errors, isSubmitted, isSubmitting } = form.formState;
  const [images, removeMediaIds, categoryId, unit, status] = form.watch([
    "images",
    "removeMediaIds",
    "categoryId",
    "unit",
    "status",
  ]);
  const descriptionLength = form.watch("description").length;

  // Ảnh cũ còn giữ — MultiImageInput chỉ hiển thị ảnh (video / file cũ không sửa ở đây).
  const existingImages = (product?.media ?? []).filter(
    (media) => media.type === "IMAGE" && !removeMediaIds.includes(media.id),
  );
  const keptMediaCount = (product?.media.length ?? 0) - removeMediaIds.length;
  const setOptions = { shouldDirty: true, shouldValidate: isSubmitted };
  const isUploading = images.some((image) => image.status === "uploading");

  // Kết quả upload chỉ ghi vào ảnh còn trong form (đã bỏ thì bỏ qua).
  const uploads = useMediaUploads({
    types: IMAGE_TYPES,
    onUpdate: (upload) => {
      const current = form.getValues("images");
      if (!current.some((image) => image.id === upload.id)) return;
      form.setValue(
        "images",
        current.map((image) => (image.id === upload.id ? upload : image)),
        { shouldValidate: form.formState.isSubmitted },
      );
    },
    onFail: (id) => removeImage(id),
  });
  const selectImages = (files: File[]) => {
    const started = uploads.start(files);
    if (started.length > 0) form.setValue("images", [...form.getValues("images"), ...started], setOptions);
  };
  const removeImage = (id: string) => {
    uploads.cancel(id);
    const current = form.getValues("images");
    if (!current.some((image) => image.id === id)) return;
    form.setValue(
      "images",
      current.filter((image) => image.id !== id),
      { shouldDirty: true, shouldValidate: form.formState.isSubmitted },
    );
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // Schema đã bắt mọi ảnh phải upload xong; giữ đúng thứ tự tile.
      const uploaded = values.images.flatMap((image) => (image.status === "done" ? [image.media] : []));
      const fields = {
        name: values.name,
        description: values.description,
        // Schema đã bắt buộc 3 field dưới → không còn null / "".
        price: values.price as number,
        quantity: values.quantity as number,
        unit: values.unit as TProductUnit,
        categoryId: values.categoryId,
      };

      if (product) {
        // Ảnh mới xếp sau các media còn giữ.
        const addMedia = uploaded.map((media, index) => ({ ...media, sortOrder: keptMediaCount + index }));
        await updateProduct.mutateAsync({
          productId: product.id,
          input: {
            ...fields,
            status: values.status,
            ...(addMedia.length > 0 && { addMedia }),
            ...(values.removeMediaIds.length > 0 && { removeMediaIds: values.removeMediaIds }),
          },
        });
        onDone(product.id);
      } else {
        const media = uploaded.map((item, index) => ({ ...item, sortOrder: index }));
        const { productId } = await createProduct.mutateAsync({ ...fields, media });
        onDone(productId);
      }
    } catch (error) {
      const code = isAppError(error) ? error.code : undefined;
      const message = code ? PRODUCT_ERROR_MESSAGES[code] : undefined;
      const field = code ? FIELD_ERRORS[code] : undefined;
      if (message && field) form.setError(field, { type: "server", message });
      else if (message) form.setError(FORM_ROOT_ERROR, { type: "server", message });
      else applyServerErrors(form, error);
    }
  });

  const rootError = errors.root?.server?.message;
  const imagesError = errors.images?.message ?? errors.images?.find?.((item) => item?.message)?.message;

  return (
    <>
      <form
        id={FORM_ID}
        onSubmit={onSubmit}
        noValidate
        className="scrollbar-thin -mx-1 flex min-h-0 flex-col gap-4 overflow-y-auto px-1"
      >
        <FormField id="product-name" label="Tên sản phẩm" required error={errors.name?.message}>
          {(control) => <Input {...control} {...form.register("name")} disabled={isSubmitting} />}
        </FormField>

        <FormField id="product-category" label="Danh mục" required error={errors.categoryId?.message}>
          {(control) => (
            <Select
              value={categoryId}
              onValueChange={(next) => form.setValue("categoryId", next, setOptions)}
              disabled={isSubmitting || !categories.data}
            >
              <SelectTrigger className="w-full" {...control}>
                <SelectValue
                  placeholder={
                    categories.isPending ? "Đang tải danh mục…" : categories.isError ? "Không tải được danh mục" : "Chọn danh mục"
                  }
                />
              </SelectTrigger>
              <SelectContent position="popper">
                {categories.data?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="product-price" label="Giá (VND)" required error={errors.price?.message}>
            {(control) => (
              <Input
                {...control}
                {...form.register("price", { setValueAs: toNumberOrNull })}
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                disabled={isSubmitting}
              />
            )}
          </FormField>

          <FormField id="product-unit" label="Đơn vị" required error={errors.unit?.message}>
            {(control) => (
              <Select
                value={unit}
                onValueChange={(next) => form.setValue("unit", next as TProductUnit, setOptions)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full" {...control}>
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {PRODUCT_UNIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField id="product-quantity" label="Số lượng" required error={errors.quantity?.message}>
            {(control) => (
              <Input
                {...control}
                {...form.register("quantity", { setValueAs: toNumberOrNull })}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                disabled={isSubmitting}
              />
            )}
          </FormField>

          {product && (
            <FormField id="product-status" label="Trạng thái" required error={errors.status?.message}>
              {(control) => (
                <Select
                  value={status}
                  onValueChange={(next) => form.setValue("status", next as TProductStatus, setOptions)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full" {...control}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {PRODUCT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          )}
        </div>
        {product && status !== "ACTIVE" && (
          <p className="-mt-2 text-xs text-muted-foreground">Sản phẩm không ở trạng thái “Đang bán” sẽ bị ẩn khỏi trang của bạn.</p>
        )}

        <FormField
          id="product-description"
          label="Mô tả"
          required
          error={errors.description?.message}
          description={`${descriptionLength}/${PRODUCT_DESCRIPTION_MAX} ký tự`}
        >
          {(control) => (
            <Textarea
              {...control}
              {...form.register("description")}
              rows={5}
              maxLength={PRODUCT_DESCRIPTION_MAX}
              placeholder="Công dụng, thành phần, quy cách đóng gói…"
              disabled={isSubmitting}
              className="resize-none"
            />
          )}
        </FormField>

        <FormField
          id="product-images"
          label="Ảnh sản phẩm"
          required={!product}
          error={errors.removeMediaIds?.message ?? imagesError}
          description={`JPG, PNG hoặc WEBP, tối đa 10MB mỗi ảnh. Mỗi lần lưu thêm / xoá tối đa ${PRODUCT_MEDIA_MAX} ảnh.`}
        >
          {(control) => (
            <MultiImageInput
              {...control}
              value={images}
              onSelect={selectImages}
              onRemove={removeImage}
              existing={existingImages}
              onRemoveExisting={(mediaId) => form.setValue("removeMediaIds", [...removeMediaIds, mediaId], setOptions)}
              max={product ? existingImages.length + PRODUCT_MEDIA_MAX : PRODUCT_MEDIA_MAX}
              accept={IMAGE_ACCEPT}
              disabled={isSubmitting}
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
        <Button type="submit" form={FORM_ID} variant="highlight" loading={isSubmitting} disabled={isUploading}>
          {isUploading ? "Đang tải ảnh…" : product ? "Lưu thay đổi" : "Thêm sản phẩm"}
        </Button>
      </DialogFooter>
    </>
  );
}
