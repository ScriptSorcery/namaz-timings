import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { usePrayerTimes, type Location } from '../../hooks/usePrayerTimes'

type Props = {
  location?: Location
  method?: number
  school?: number
}

export function NextPrayerCountdown({ location, method, school }: Props) {
  const { nextPrayer, loading, error } = usePrayerTimes(location, {
    method,
    school,
  })

  const [countdown, setCountdown] = useState<string>('')

  // Avoid multiple reloads
  const hasReloadedRef = useRef(false)

  // Compute the target Date for the next prayer
  const targetTime = useMemo(() => {
    if (!nextPrayer) return null

    // Aladhan style "05:12" or "05:12 (IST)" → take first part
    const timePart = nextPrayer.time.split(' ')[0]
    const [hStr, mStr] = timePart.split(':')
    const h = Number(hStr)
    const m = Number(mStr)
    if (Number.isNaN(h) || Number.isNaN(m)) return null

    const now = new Date()
    const target = new Date(now)
    target.setHours(h, m, 0, 0)

    // if time already passed for today, we treat it as "no next prayer"
    if (target.getTime() <= now.getTime()) return null

    return target
  }, [nextPrayer?.time])

  // Tick every second
  useEffect(() => {
    if (!targetTime) {
      setCountdown('')
      return
    }

    const update = () => {
      const nowMs = Date.now()
      const diff = targetTime.getTime() - nowMs

      if (diff <= 0) {
        setCountdown('00:00')

        if (!hasReloadedRef.current) {
          hasReloadedRef.current = true
          // hard refresh to get new nextPrayer from API
          window.location.reload()
        }

        return
      }

      setCountdown(formatDuration(diff))
    }

    // run once immediately
    update()

    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetTime])

  if (!location) return null

  if (loading) {
    return (
      <Card className="p-3 text-sm flex justify-between items-center animate-pulse">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </Card>
    )
  }

  if (error || !nextPrayer || !targetTime) return null

  return (
    <Card className="p-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
      <div className="flex items-baseline gap-1">
        <span className="font-medium">Next:</span>
        <span className="font-semibold">{nextPrayer.name}</span>
        <span className="font-mono text-xs text-muted-foreground">
          ({nextPrayer.time})
        </span>
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground">
        In {countdown || '--:--'}
      </div>
    </Card>
  )
}

// HH:MM:SS / MM:SS depending on hours
function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}
