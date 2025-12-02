import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PrayerTimeRow } from './PrayerTimeRow'
import { usePrayerTimes, type Location } from '../../hooks/usePrayerTimes'

type Props = {
  location?: Location
  method?: number
  school?: number
}

export function PrayerTimesCard({ location, method, school }: Props) {
  const {
    timings,
    dateLabel,
    loading,
    error,
    displayOrder,
    nextPrayer,
    currentPrayer,
  } = usePrayerTimes(location, { method, school })


  if (!location) {
    return (
      <Card className="shadow-sm border border-dashed">
        <CardContent className="py-4 text-sm text-muted-foreground">
          Select a location to view today&apos;s namaz timings.
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="shadow-sm border border-border bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Today&apos;s Namaz Timings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-6 w-full rounded bg-muted animate-pulse"
            />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/60 bg-destructive/5">
        <CardContent className="py-3 text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (!timings) return null

  const primaryLabel =
    location.city ?? location.region ?? location.country ?? 'Location'

  const coordsLabel =
    location.lat != null && location.lon != null
      ? `${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`
      : ''

  return (
    <Card className="shadow-sm border border-border bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span>Today&apos;s Namaz Timings</span>
            {dateLabel && (
              <span className="text-xs text-muted-foreground">{dateLabel}</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{primaryLabel}</span>
            {coordsLabel && <span className="font-mono">{coordsLabel}</span>}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 pt-2">
        <div className="rounded-md border border-border/60 divide-y divide-border/60 bg-card">
          {displayOrder.map((name) =>
            !timings[name] ? null : (
              <PrayerTimeRow
                key={name}
                name={name}
                time={timings[name]}
                isNext={nextPrayer?.name === name}
                isCurrent={currentPrayer === name}
              />
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
