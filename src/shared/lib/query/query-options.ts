import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

/** Dùng trong `features/<x>/hooks/<entity>.queries.ts` — dùng lại cho hook và prefetch ở page. */
export const appQueryOptions = queryOptions;
export const appInfiniteQueryOptions = infiniteQueryOptions;
