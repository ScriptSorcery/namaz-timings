import { useEffect, useState } from "react";
import {
  getTimingsByCoordinates,
  getTimingsByCity,
  getTimingsByAddress,
} from "../api/prayerApi";

export type Location = {
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

type Options = {
  method?: number;
  school?: number;
};

type NextPrayer = {
  name: string;
  time: string;
  countdownMs: number;
  countdownText: string;
};

// Used for current/next calculation (5 fard prayers)
const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

// Used for UI display (includes Sunrise + Sunset)
const DISPLAY_ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Sunset", "Isha"];


export function usePrayerTimes(
  location?: Location,
  { method, school }: Options = {}
) {
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [dateLabel, setDateLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!location) {
        setTimings(null);
        setDateLabel(null);
        setNextPrayer(null);
        setCurrentPrayer(null);
        return;
      }

      setLoading(true);
      setError(null);
      setTimings(null);
      setDateLabel(null);
      setNextPrayer(null);
      setCurrentPrayer(null);

      try {
        let data: any = null;

        if (location.lat != null && location.lon != null) {
          data = await getTimingsByCoordinates(location.lat, location.lon, {
            method,
            school,
          });
        } else if (location.city && location.country) {
          data = await getTimingsByCity(location.city, location.country, {
            method,
            school,
          });
        } else if (location.city) {
          data = await getTimingsByAddress(location.city, { method, school });
        } else {
          throw new Error("Incomplete location");
        }

        if (cancelled) return;

        const t: Record<string, string> | null = data?.timings ?? null;
        setTimings(t);

        const readable =
          data?.date?.readable ??
          (data?.meta?.timezone ? `Timezone: ${data.meta.timezone}` : null);
        setDateLabel(readable ?? null);

        if (t) {
          const np = computeNextPrayer(t);
          setNextPrayer(np);

          const cp = findCurrentPrayer(t);
          setCurrentPrayer(cp);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load timings");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [location?.lat, location?.lon, location?.city, location?.country, method, school]);

  return {
    timings,
    dateLabel,
    loading,
    error,
    order: PRAYER_ORDER,       // keep if you still need it
    displayOrder: DISPLAY_ORDER, // 👈 add this
    nextPrayer,
    currentPrayer,
  };
}

// --- helpers ---

// Figures out which of the 5 is "current"
function findCurrentPrayer(timings: Record<string, string>): string | null {
  const now = new Date();
  let lastPast: string | null = null;

  const validOrder = PRAYER_ORDER.filter((name) => timings[name]);

  for (const name of validOrder) {
    const raw = timings[name];
    if (!raw) continue;

    const t = raw.split(" ")[0];
    const [hStr, mStr] = t.split(":");
    const h = Number(hStr);
    const m = Number(mStr);

    const dt = new Date();
    dt.setHours(h, m, 0, 0);

    if (dt <= now) {
      lastPast = name;
    }
  }

  // Before Fajr (after midnight), nothing has "passed" yet.
  // In that case we treat the last prayer (Isha) as current.
  if (!lastPast && validOrder.length > 0) {
    return validOrder[validOrder.length - 1]; // usually Isha
  }

  return lastPast;
}

function computeNextPrayer(timings: Record<string, string>): NextPrayer | null {
  const now = new Date();
  let best: { key: string; time: string; diffMs: number } | null = null;

  for (const key of PRAYER_ORDER) {
    const raw = timings[key];
    if (!raw) continue;

    const timePart = raw.split(" ")[0];
    const [hStr, mStr] = timePart.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isNaN(h) || Number.isNaN(m)) continue;

    const dt = new Date();
    dt.setHours(h, m, 0, 0);

    const diff = dt.getTime() - now.getTime();
    if (diff > 0 && (!best || diff < best.diffMs)) {
      best = { key, time: raw, diffMs: diff };
    }
  }

  if (!best) return null;

  return {
    name: best.key,
    time: best.time,
    countdownMs: best.diffMs,
    countdownText: formatDuration(best.diffMs),
  };
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}
