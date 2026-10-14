import {
  useMutation,
  useQueryClient,
  type DefaultError,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";

export type TAppMutationOptions<TData, TVariables, TOnMutateResult> = UseMutationOptions<
  TData,
  DefaultError,
  TVariables,
  TOnMutateResult
> & {
  /**
   * Query keys bị stale sau khi mutation thành công — BẮT BUỘC khai báo.
   * `false` chỉ khi mutation tự cập nhật cache (`setQueryData`, optimistic update).
   */
  invalidates: ((variables: TVariables, data: TData) => QueryKey[]) | false;
};

export function useAppMutation<TData = unknown, TVariables = void, TOnMutateResult = unknown>({
  invalidates,
  onSuccess,
  ...options
}: TAppMutationOptions<TData, TVariables, TOnMutateResult>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    onSuccess: async (data, variables, ...rest) => {
      if (invalidates) {
        await Promise.all(
          invalidates(variables, data).map((queryKey) => queryClient.invalidateQueries({ queryKey })),
        );
      }
      return onSuccess?.(data, variables, ...rest);
    },
  });
}
