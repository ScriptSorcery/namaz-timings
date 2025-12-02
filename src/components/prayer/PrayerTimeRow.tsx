import { Badge } from '@/components/ui/badge'

interface PrayerTimeRowProps {
  name: string
  time: string
  isNext?: boolean
  isCurrent?: boolean
}

export function PrayerTimeRow({ name, time, isNext, isCurrent }: PrayerTimeRowProps) {
  // Highlight current prayer stronger than next
  const rowClasses = isCurrent
    ? 'bg-green-100 dark:bg-green-900/30'
    : isNext
    ? 'bg-blue-100 dark:bg-blue-900/30'
    : 'hover:bg-muted/60 dark:hover:bg-muted/40'

  function to12Hour(time: string): string {
    const clean = time.split(" ")[0]
    const [hStr, mStr] = clean.split(":")
    let h = Number(hStr)
    const m = Number(mStr)
    if (isNaN(h) || isNaN(m)) return time

    const suffix = h >= 12 ? "PM" : "AM"
    h = h % 12
    if (h === 0) h = 12

    return `${h}:${m.toString().padStart(2, "0")} ${suffix}`
  }

  return (
    <div
      className={
        'flex items-center justify-between px-3 py-2 text-sm transition-colors ' +
        rowClasses
      }
    >
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>

        {isCurrent && (
          <span className="text-[10px] uppercase tracking-wide text-green-700 dark:text-green-300">
            Current
          </span>
        )}

        {!isCurrent && isNext && (
          <span className="text-[10px] uppercase tracking-wide text-blue-700 dark:text-blue-300">
            Upcoming
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isCurrent && (
          <Badge
            variant="secondary"
            className="bg-green-600 text-white dark:bg-green-500 text-[10px] px-2 py-0.5 rounded-full"
          >
            Current
          </Badge>
        )}

        {!isCurrent && isNext && (
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white dark:bg-blue-400 text-[10px] px-2 py-0.5 rounded-full"
          >
            Next
          </Badge>
        )}

        <span className="font-mono text-sm">{to12Hour(time)}</span>
      </div>
    </div>
  )
}
