import { Button } from '@/components/ui/button'

type MainErrorFallbackProps = {
  error: Error
  resetErrorBoundary: () => void
}

export const MainErrorFallback = ({
  error,
  resetErrorBoundary,
}: MainErrorFallbackProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          We're sorry, but an unexpected error occurred.
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-slate-100 p-4 text-left text-sm text-red-600">
            {error.message}
          </pre>
        )}
        <div className="mt-8">
          <Button onClick={resetErrorBoundary}>Try again</Button>
        </div>
      </div>
    </div>
  )
}
