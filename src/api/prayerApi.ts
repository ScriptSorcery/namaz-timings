const BASE = "https://api.aladhan.com/v1";

type AladhanResponse<T> = {
  code: number;
  status: string;
  data: T;
};

// ------------------------------
// Generic Aladhan Fetcher
// ------------------------------
async function fetchAladhan<T = any>(
  path: string,
  params: Record<string, string | number | undefined> = {}
) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

  const url = `${BASE}${path}${qs ? "?" + qs : ""}`;
  const res = await fetch(url);

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Aladhan API error ${res.status}: ${txt}`);
  }

  const json = (await res.json()) as AladhanResponse<T>;
  if (json.code !== 200) throw new Error(`Aladhan responded with code ${json.code}: ${json.status}`);

  return json.data;
}

// ------------------------------
// Daily Timings
// ------------------------------
export async function getTimingsByCoordinates(
  latitude: number,
  longitude: number,
  opts?: { method?: number; date?: string | number; school?: number }
) {
  return fetchAladhan("/timings", {
    latitude,
    longitude,
    method: opts?.method,
    date: opts?.date,
    school: opts?.school,
  });
}

export async function getTimingsByCity(
  city: string,
  country: string,
  opts?: { method?: number; school?: number }
) {
  return fetchAladhan("/timingsByCity", {
    city,
    country,
    method: opts?.method,
    school: opts?.school,
  });
}

export async function getTimingsByAddress(address: string, opts?: { method?: number; school?: number }) {
  return fetchAladhan("/timingsByAddress", {
    address,
    method: opts?.method,
    school: opts?.school,
  });
}

// ------------------------------
// Monthly calendars
// ------------------------------
export async function getCalendarByCoordinates(
  latitude: number,
  longitude: number,
  month: number,
  year: number,
  opts?: { method?: number; school?: number }
) {
  return fetchAladhan("/calendar", {
    latitude,
    longitude,
    month,
    year,
    method: opts?.method,
    school: opts?.school,
  });
}

export async function getCalendarByCity(
  city: string,
  country: string,
  month: number,
  year: number,
  opts?: { method?: number; school?: number }
) {
  return fetchAladhan("/calendarByCity", {
    city,
    country,
    month,
    year,
    method: opts?.method,
    school: opts?.school,
  });
}

// ------------------------------
// Ramadan Calendar Types
// ------------------------------
export interface AladhanCalendarDay {
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      weekday: { en: string };
    };
    hijri: {
      date: string;
      day: string;
      month: { number: number; en: string; ar: string };
      weekday: { en: string; ar: string };
      year: string;
    };
  };
  timings: {
    [key: string]: string;
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
  };
}

// ------------------------------
// Time Helpers
// ------------------------------
function stripTimezone(t: string): string {
  return t.replace(/\s*\(.+\)$/, ""); // "05:20 (IST)" -> "05:20"
}

function addMinutesToTime(time: string, minutesToAdd: number): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return time;

  let hours = parseInt(match[1], 10);
  let minutes = parseInt(match[2], 10);

  minutes += minutesToAdd;
  hours += Math.floor(minutes / 60);
  minutes = minutes % 60;
  hours = hours % 24;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Reuse your own AM/PM conversion logic
function toAmPm(time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return time;

  let hours = Number(match[1]);
  const minutes = match[2];

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${ampm}`;
}

// ------------------------------
// Final formatting pipeline for Ramadan timings
// ------------------------------
function adjustPrayerTimes(timings: AladhanCalendarDay["timings"]): AladhanCalendarDay["timings"] {
  const result: Record<string, string> = {};

  for (const [key, raw] of Object.entries(timings)) {
    let time = stripTimezone(raw);

    // Apply your offsets *FIRST*
    if (key === "Dhuhr" || key === "Asr") {
      time = addMinutesToTime(time, 45);
    } else if (key === "Maghrib") {
      time = addMinutesToTime(time, 5);
    }

    // Convert *after adjustments*
    result[key] = toAmPm(time);
  }

  return result as AladhanCalendarDay["timings"];
}

// ------------------------------
// Hijri Year Helper
// ------------------------------
async function fetchCurrentHijriYear(): Promise<number> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const res = await fetch(`https://api.aladhan.com/v1/gToH/${dd}-${mm}-${yyyy}`);
  if (!res.ok) throw new Error("Failed to convert date to Hijri");

  const json = await res.json();
  const year = Number(json?.data?.hijri?.year);
  if (!year) throw new Error("Invalid Hijri year from API");

  return year;
}

// ------------------------------
// Ramadan Calendar Fetcher
// ------------------------------
export async function fetchRamzanCalendarByCoordinates(params: {
  latitude: number;
  longitude: number;
  method?: number;
}): Promise<AladhanCalendarDay[]> {
  const { latitude, longitude, method = 2 } = params;

  const hijriYear = await fetchCurrentHijriYear();
  const ramzanMonth = 9;

  const url = new URL("https://api.aladhan.com/v1/hijriCalendar");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("method", String(method));
  url.searchParams.set("month", String(ramzanMonth));
  url.searchParams.set("year", String(hijriYear));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch Ramzan calendar");

  const json = await res.json();
  const days: AladhanCalendarDay[] = json?.data ?? [];

  // 👇 KEY: Apply adjustments + AM/PM
  return days.map((day) => ({
    ...day,
    timings: adjustPrayerTimes(day.timings),
  }));
}
