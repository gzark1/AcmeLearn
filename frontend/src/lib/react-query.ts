import { type DefaultOptions, type UseMutationOptions } from '@tanstack/react-query'

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  },
} satisfies DefaultOptions

// Type helper for extracting return type from async functions
export type ApiFnReturnType<FnType extends (...args: never[]) => Promise<unknown>> = Awaited<
  ReturnType<FnType>
>

// Type helper for query options (omits queryKey and queryFn since those are defined in the hook)
export type QueryConfig<T extends (...args: never[]) => unknown> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>

// Type helper for mutation options
export type MutationConfig<MutationFnType extends (...args: never[]) => Promise<unknown>> =
  UseMutationOptions<
    ApiFnReturnType<MutationFnType>,
    Error,
    Parameters<MutationFnType>[0]
  >
