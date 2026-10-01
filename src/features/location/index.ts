// Public API của feature `location`.
export { AddressFields, type TAddressFieldsProps } from "./components/address-fields";
export { provincesQuery, wardsQuery } from "./hooks/location.queries";
export { type TAddressCodes, useAddressLabel } from "./hooks/use-address-label";
export { useProvinces } from "./hooks/use-provinces";
export { useWards } from "./hooks/use-wards";
export type { TAddressFieldsErrors, TAddressFieldsValue, TProvince, TWard } from "./types/location.types";
