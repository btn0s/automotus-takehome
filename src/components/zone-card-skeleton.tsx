import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ZoneCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}
