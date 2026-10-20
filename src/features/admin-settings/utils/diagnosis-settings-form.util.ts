import { BYTES_PER_MB, NO_DEFAULT_CROP } from "../constants/admin-settings.constants";
import type {
  TDiagnosisSettingsAdmin,
  TDiagnosisSettingsFormValues,
  TUpdateDiagnosisSettingsInput,
} from "../types/admin-settings.types";

/** Bytes → MB, làm tròn 2 chữ số (5242880 → 5). */
const toMb = (bytes: number) => Math.round((bytes / BYTES_PER_MB) * 100) / 100;

export const toDiagnosisSettingsFormValues = (settings: TDiagnosisSettingsAdmin): TDiagnosisSettingsFormValues => ({
  dailyFreeLimit: settings.dailyFreeLimit,
  defaultCropType: settings.defaultCropType ?? NO_DEFAULT_CROP,
  maxImages: settings.maxImages,
  maxImageMb: toMb(settings.maxImageBytes),
  maxImageWidth: settings.maxImageWidth,
  maxImageHeight: settings.maxImageHeight,
});

/** Gọi sau khi schema đã validate (số không còn null). MB → bytes nguyên. */
export const toUpdateDiagnosisSettingsInput = (values: TDiagnosisSettingsFormValues): TUpdateDiagnosisSettingsInput => ({
  dailyFreeLimit: values.dailyFreeLimit as number,
  defaultCropType: values.defaultCropType === NO_DEFAULT_CROP ? null : values.defaultCropType,
  maxImages: values.maxImages as number,
  maxImageBytes: Math.round((values.maxImageMb as number) * BYTES_PER_MB),
  maxImageWidth: values.maxImageWidth as number,
  maxImageHeight: values.maxImageHeight as number,
});

/** `details.field` của DIAGNOSIS_INVALID_SETTINGS → field form (bytes nhập theo MB). */
export const SETTINGS_ERROR_FIELDS: Record<string, keyof TDiagnosisSettingsFormValues> = {
  dailyFreeLimit: "dailyFreeLimit",
  defaultCropType: "defaultCropType",
  maxImages: "maxImages",
  maxImageBytes: "maxImageMb",
  maxImageWidth: "maxImageWidth",
  maxImageHeight: "maxImageHeight",
};
