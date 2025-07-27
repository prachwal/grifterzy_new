import { useState, useCallback } from 'react'

interface UseAsyncErrorOptions {
  onError?: (error: Error) => void
}

/**
 * Hook do obsługi błędów asynchronicznych
 * Pozwala na wyrzucenie błędu który zostanie złapany przez ErrorBoundary
 */
export const useAsyncError = (options?: UseAsyncErrorOptions) => {
  const [error, setError] = useState<Error | null>(null)

  const throwError = useCallback(
    (error: Error) => {
      if (options?.onError) {
        options.onError(error)
      }
      setError(error)
      throw error
    },
    [options]
  )

  const handleAsyncError = useCallback(
    (asyncFn: () => Promise<any>) => {
      return asyncFn().catch(error => {
        console.error('Async error caught:', error)
        throwError(error instanceof Error ? error : new Error(String(error)))
      })
    },
    [throwError]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Re-throw error to be caught by ErrorBoundary
  if (error) {
    throw error
  }

  return {
    handleAsyncError,
    clearError,
    throwError,
  }
}
