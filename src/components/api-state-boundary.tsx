'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react'

interface ApiStateBoundaryProps {
  isLoading: boolean
  error: Error | null
  onRetry?: () => void
  empty?: boolean
  emptyMessage?: ReactNode
  children: ReactNode
}

export function ApiStateBoundary({
  isLoading,
  error,
  onRetry,
  empty,
  emptyMessage,
  children,
}: ApiStateBoundaryProps) {
  if (isLoading) {
    return <>{children}</>
  }

  if (error) {
    const errorMessage = error.message || "Something went wrong";
    const isDemoError = errorMessage.includes("Simulated API error");

    return (
      <div className="border border-destructive/30 bg-destructive/5">
        <div className="px-3 py-2 border-b border-destructive/20 bg-destructive/10">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-3.5 text-destructive" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-destructive">
              Error
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isDemoError
              ? "This is a simulated error for demo purposes. Remove ?error=true from the URL to see normal behavior."
              : errorMessage}
          </p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="mt-3 h-8 text-[10px] font-bold uppercase"
            >
              <RefreshCw className="mr-1.5 size-3" aria-hidden="true" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <>
        {emptyMessage || (
          <div className="border bg-card">
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="bg-muted p-2.5 mb-3">
                <Inbox className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                No data available
              </p>
              <p className="text-muted-foreground/70 mt-1 max-w-[180px] text-[10px] leading-tight">
                There&apos;s nothing to display here right now.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>
}
