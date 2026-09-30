import type { components, paths } from "./openapi";

/** Type của một schema trong specs/openapi.json — vd: `TApiSchema<'LoginUserResponse'>`. */
export type TApiSchema<K extends keyof components["schemas"]> = components["schemas"][K];

export type TApiPaths = paths;
