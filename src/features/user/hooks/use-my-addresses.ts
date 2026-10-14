import { useAppQuery } from "@/shared/lib/query";
import type { TMyAddressesResponse } from "../types/user.types";
import { myAddressesQuery } from "./user.queries";

const selectAddresses = ({ addresses }: TMyAddressesResponse) => addresses;

/** `enabled: false` cho guest / người không phải owner — endpoint cần phiên. */
export const useMyAddresses = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useAppQuery({ ...myAddressesQuery(), select: selectAddresses, enabled });
