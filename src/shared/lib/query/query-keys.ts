/**
 * Registry TẬP TRUNG của query keys — nơi duy nhất được viết key.
 * Mỗi feature một namespace, factory pattern, `as const`:
 *
 *   crops: {
 *     all: ['crops'] as const,
 *     lists: () => [...queryKeys.crops.all, 'list'] as const,
 *     list: (filters: TCropFilters) => [...queryKeys.crops.lists(), filters] as const,
 *     detail: (id: string) => [...queryKeys.crops.all, 'detail', id] as const,
 *   },
 *
 * Type filter lấy từ feature bằng `import type` qua index của feature.
 */
export const queryKeys = {
  location: {
    all: ["location"] as const,
    provinces: () => [...queryKeys.location.all, "provinces"] as const,
    wards: (provinceCode: string) => [...queryKeys.location.all, "wards", provinceCode] as const,
  },
} as const;
