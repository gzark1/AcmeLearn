import type { DefaultOptions } from '@tanstack/react-query'

export const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes (garbage collection)
    retry: 1,
    refetchOnWindowFocus: false,
  },
}
