import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as React from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { MainErrorFallback } from '@/components/errors/main-error-fallback'
import { Toaster } from '@/components/ui/toast'
import { Spinner } from '@/components/ui/spinner'
import { queryConfig } from '@/lib/react-query'
import { AuthLoader } from '@/lib/auth'

type AppProviderProps = {
  children: React.ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = React.useState(
    () => new QueryClient({ defaultOptions: queryConfig })
  )

  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="xl" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <QueryClientProvider client={queryClient}>
          {import.meta.env.DEV && <ReactQueryDevtools />}
          <Toaster />
          <AuthLoader>{children}</AuthLoader>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.Suspense>
  )
}
