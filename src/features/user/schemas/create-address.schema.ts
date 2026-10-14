import { rules, schema } from "@/shared/lib/validation";
import type { TCreateAddressFormValues } from "../types/user.types";

/** Mirror CreateAddressDto (POST /users/me/addresses) — `isPrimary` không có trên form (address mới luôn là thường). */
export const createAddressSchema = schema<TCreateAddressFormValues>(rules.addressFields());
