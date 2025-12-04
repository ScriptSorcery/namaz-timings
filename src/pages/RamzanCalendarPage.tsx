import { useEffect, useMemo, useState } from "react";
import { useLocation } from "@/context/LocationContext";
import {
  fetchRamzanCalendarByCoordinates,
  type AladhanCalendarDay,
} from "@/api/prayerApi";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Status = "idle" | "loading" | "success" | "error";

function dayMatches(d: Date, day: AladhanCalendarDay): boolean {
  const [dd, mm, yyyy] = day.date.gregorian.date.split("-").map(Number);
  return (
    d.getFullYear() === yyyy &&
    d.getMonth() === mm - 1 &&
    d.getDate() === dd
  );
}

function formatTimeLabel(label: string): string {
  if (label === "Fajr") return "Fajr (Sehri end)";
  if (label === "Maghrib") return "Maghrib (Iftar)";
  return label;
}

// new helper: dd mmm yyyy (e.g. 05 Apr 2025)
function formatDateDDMMMYYYY(d?: Date | null) {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const m = months[d.getMonth()] ?? "";
  const yyyy = d.getFullYear();
  return `${dd} ${m} ${yyyy}`;
}
export function RamzanCalendarPage() {
  const { location } = useLocation();

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<AladhanCalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [ramzanStart, setRamzanStart] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "cards">("calendar");

  // Countdown timer
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function getCountdownText(start: Date) {
    const diff = start.getTime() - now.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  // Toast on error (once)
  useEffect(() => {
    if (status === "error" && error) {
      toast.error(`Failed to load Ramzan calendar: ${error}`);
    }
  }, [status, error]);

  // Fetch on mount / when location changes
  useEffect(() => {
    // reset UI as soon as location changes so old data doesn't linger
    setDays([]);
    setRamzanStart(null);
    setSelectedDate(undefined);
    setError(null);
    setStatus("idle");

    if (!location) return;

    const lat =
      (location as any).lat ??
      (location as any).latitude ??
      (location as any).coords?.lat;

    const lon =
      (location as any).lon ??
      (location as any).lng ??
      (location as any).longitude ??
      (location as any).coords?.lng ??
      (location as any).coords?.lon;

    if (lat == null || lon == null) return;

    let cancelled = false;
    setStatus("loading");
    setError(null);

    fetchRamzanCalendarByCoordinates({
      latitude: lat,
      longitude: lon,
      method: 2,
    })
      .then((data) => {
        if (cancelled) return;
        setDays(data || []);
        setStatus("success");

        if (data && data.length > 0) {
          const [dd, mm, yyyy] = data[0].date.gregorian.date
            .split("-")
            .map(Number);
          const firstDate = new Date(yyyy, mm - 1, dd);

          // prefer Imsak (sehri end) time, fallback to Fajr if missing
          const timings = data[0].timings as Record<string, string>;
          const timeStr = timings["Imsak"] ?? timings["Fajr"] ?? "";
          const timePart = timeStr.split(" ")[0]; // "05:12 (IST)" -> "05:12"
          const [hStr, mStr] = timePart.split(":");
          const h = Number(hStr);
          const m = Number(mStr);
          if (!Number.isNaN(h) && !Number.isNaN(m)) {
            firstDate.setHours(h, m, 0, 0);
          } else {
            // keep midnight if parse failed
            firstDate.setHours(0, 0, 0, 0);
          }

          setRamzanStart(firstDate);
          setSelectedDate(firstDate);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        console.error(e);
        setError((e as any).message || "Something went wrong");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  const selectedDay = useMemo<AladhanCalendarDay | undefined>(() => {
    if (!selectedDate || days.length === 0) return undefined;
    return days.find((d) => dayMatches(selectedDate, d));
  }, [selectedDate, days]);

  const locationLabel =
    (location as any)?.displayName ||
    (location as any)?.label ||
    `${(location as any)?.city ?? ""} ${(location as any)?.country ?? ""}`.trim();

  const TIMING_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

  const getTiming = (day: AladhanCalendarDay, key: string) =>
    (day.timings as Record<string, string>)[key] ?? "-";

  // Replace previous Card-based timetable with a neutral panel
  const timetablePanel = (
  <aside className="rounded-lg border border-slate-200/60 bg-white/60 dark:bg-slate-900/50 dark:border-slate-700/60 backdrop-blur-md p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold">Full Ramzan timetable</h3>
      <span className="text-xs text-muted-foreground">{days.length} days</span>
    </div>

    {status === "loading" && (
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    )}

    {status === "success" && days.length > 0 && (
      <div className="overflow-auto max-h-[48vh]">
        <table
          className="w-full text-left text-xs border-separate"
          style={{ borderSpacing: 0 }}
        >
          <thead className="sticky top-0 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm">
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {/* notice the pl-3 here */}
              <th className="py-2 pr-2 pl-3 text-left w-8">#</th>
              <th className="py-2 pr-2 text-left">Date</th>
              <th className="py-2 pr-2">Fajr</th>
              <th className="py-2 pr-2">Dhuhr</th>
              <th className="py-2 pr-2">Asr</th>
              <th className="py-2 pr-2">Maghrib</th>
              <th className="py-2 pr-2">Isha</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, idx) => {
              const isSelected = selectedDate && dayMatches(selectedDate, day);
              const [dd, mm, yyyy] = day.date.gregorian.date
                .split("-")
                .map(Number);
              return (
                <tr
                  key={day.date.gregorian.date}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                  onClick={() => setSelectedDate(new Date(yyyy, mm - 1, dd))}
                >
                  {/* pl-3 instead of ml-2 */}
                  <td className="py-2 pr-2 pl-3 align-middle font-medium w-8">
                    {idx + 1}
                  </td>
                  <td className="py-2 pr-2 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium">
                        {day.date.gregorian.date}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {day.date.hijri.date}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-2 align-middle">
                    {(day.timings as Record<string, string>)["Fajr"]}
                  </td>
                  <td className="py-2 pr-2 align-middle">
                    {(day.timings as Record<string, string>)["Dhuhr"]}
                  </td>
                  <td className="py-2 pr-2 align-middle">
                    {(day.timings as Record<string, string>)["Asr"]}
                  </td>
                  <td className="py-2 pr-2 align-middle">
                    {(day.timings as Record<string, string>)["Maghrib"]}
                  </td>
                  <td className="py-2 pr-2 align-middle">
                    {(day.timings as Record<string, string>)["Isha"]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}

    {status === "success" && days.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No Ramzan days returned for this year/location.
      </p>
    )}
  </aside>
);


  return (
    <main className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* Header + view mode switch */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-indigo-500 p-1">
              <span className="sr-only">Ramzan</span>
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z" fill="white"/>
                <path d="M12 6C16.4183 6 20 9.58172 20 14C20 18.4183 16.4183 22 12 22C7.58172 22 4 18.4183 4 14C4 9.58172 7.58172 6 12 6Z" fill="white" opacity="0.12"/>
              </svg>
            </span>
            Ramzan Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            Sehri &amp; Iftar times for <span className="font-medium">{locationLabel || "your location"}</span> based on Hijri calendar.
          </p>
        </div>

       {!(ramzanStart && ramzanStart.getTime() > now.getTime() && status === "success") && <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
            <Label htmlFor="view-mode-switch" className="cursor-pointer">
              {viewMode === "calendar" ? "Calendar view" : "Cards view"}
            </Label>
            <Switch
              id="view-mode-switch"
              checked={viewMode === "cards"}
              onCheckedChange={(checked) => setViewMode(checked ? "cards" : "calendar")}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <div className="text-right">
              <div className="font-medium">{status === "loading" ? "Loading…" : status === "error" ? "Error" : "Ready"}</div>
              <div className="text-[11px] text-muted-foreground">{days.length} days</div>
            </div>
          </div>
        </div>}
      </div>

      {!location && <p className="text-sm text-destructive">Please select a location first to view the Ramzan calendar.</p>}

      {/* CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          {/* before ramzan */}
          {ramzanStart && ramzanStart.getTime() > now.getTime() && status === "success" ? (
            <>
              <div className="rounded-lg border border-slate-200/60 bg-white/60 dark:bg-slate-900/50 dark:border-slate-700/60 backdrop-blur-md p-6 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-3">
                  <h2 className="text-lg font-semibold">Ramzan begins soon</h2>
                </div>
                <p className="text-sm text-muted-foreground">First fast starts on:</p>
                <p className="text-xl font-medium mt-2">{formatDateDDMMMYYYY(ramzanStart)}</p>
                <div className="inline-flex items-center gap-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/30 px-4 py-2 text-indigo-700 dark:text-indigo-300 font-semibold mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 108 8 8 8 0 00-8-8z"/></svg>
                  <span>{getCountdownText(ramzanStart)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">The calendar will unlock automatically when Ramzan begins.</p>
              </div>

              {timetablePanel}
            </>
          ) : (
            <>
              {/* left: calendar + selected day */}
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200/60 bg-white/60 dark:bg-slate-900/50 dark:border-slate-700/60 backdrop-blur-md p-4 shadow-sm">
                  {status === "loading" && (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-72 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  )}

                  {status === "error" && <p className="text-sm text-destructive">Failed to load Ramzan calendar: {error}</p>}

                  {status === "success" && days.length === 0 && <p className="text-sm text-muted-foreground">No Ramzan days returned for this year/location.</p>}

                  {status === "success" && days.length > 0 && (
                    <div className="md:flex md:flex-col md:gap-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        disabled={(date) => !days.some((d) => dayMatches(date, d))}
                      />
                    </div>
                  )}
                </div>

                {/* selected day details */}
                <div className="rounded-lg border border-slate-200/40 bg-white/40 dark:bg-slate-900/40 dark:border-slate-700/50 backdrop-blur-sm p-4 shadow-xs">
                  {selectedDay ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{selectedDay.date.hijri.weekday.en}, {selectedDay.date.hijri.date} (Hijri)</div>
                          <div className="text-muted-foreground text-sm">
                            {(() => {
                              const [dd, mm, yyyy] = selectedDay.date.gregorian.date.split("-").map(Number);
                              return new Date(yyyy, mm - 1, dd).toLocaleDateString();
                            })()} (Gregorian)
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{locationLabel}</div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg p-3 bg-linear-to-b from-white/60 to-transparent dark:from-slate-800/60 border">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sehri</div>
                          <div className="mt-1 text-lg font-semibold">{(selectedDay.timings as Record<string, string>)["Imsak"] || (selectedDay.timings as Record<string, string>)["Fajr"]}</div>
                          <div className="text-xs text-muted-foreground">Imsak / Fajr</div>
                        </div>

                        <div className="rounded-lg p-3 bg-amber-50/60 dark:bg-amber-900/10 border">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Iftar</div>
                          <div className="mt-1 text-lg font-semibold">{(selectedDay.timings as Record<string, string>)["Maghrib"]}</div>
                          <div className="text-xs text-muted-foreground">Maghrib</div>
                        </div>
                      </div>

                      <div className="grid gap-2 text-xs sm:grid-cols-3">
                        {TIMING_KEYS.map((key) => (
                          <div key={key} className="flex items-center justify-between rounded border px-2 py-1 bg-white/30 dark:bg-slate-800/40">
                            <span className="font-medium">{formatTimeLabel(key)}</span>
                            <span>{getTiming(selectedDay, key)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Select any highlighted date in the calendar to view its Sehri &amp; Iftar timings.</p>
                  )}
                </div>
              </div>

              {timetablePanel}
            </>
          )}
        </section>
      )}

      {/* CARDS VIEW – only after Ramzan starts */}
      {ramzanStart && ramzanStart.getTime() <= now.getTime() && viewMode === "cards" && (
        <section className="space-y-3">
          {status === "loading" && (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {status === "error" && <p className="text-sm text-destructive">Failed to load Ramzan calendar: {error}</p>}

          {status === "success" && days.length === 0 && <p className="text-sm text-muted-foreground">No Ramzan days returned for this year/location.</p>}

          {status === "success" && days.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {days.map((day) => {
                const [dd, mm, yyyy] = day.date.gregorian.date.split("-").map(Number);
                const isSelected = selectedDate && dayMatches(selectedDate, day);

                return (
                  <article
                    key={day.date.gregorian.date}
                    className={`flex flex-col justify-between rounded-lg p-4 border transition-shadow ${isSelected ? "ring-2 ring-indigo-400/40" : "hover:shadow-lg"} bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm`}
                    onClick={() => setSelectedDate(new Date(yyyy, mm - 1, dd))}
                  >
                    <header className="flex items-center justify-between pb-2">
                      <h4 className="text-sm font-semibold">{day.date.hijri.date}</h4>
                      <span className="text-xs text-muted-foreground">{day.date.gregorian.date}</span>
                    </header>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between rounded-md bg-indigo-50/40 px-2 py-1">
                        <span className="font-medium">Sehri</span>
                        <span className="font-semibold">{(day.timings as Record<string, string>)["Imsak"] || (day.timings as Record<string, string>)["Fajr"]}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-md bg-amber-50/60 dark:bg-amber-900/10 px-2 py-1">
                        <span className="font-medium">Iftar</span>
                        <span className="font-semibold">{(day.timings as Record<string, string>)["Maghrib"]}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        {TIMING_KEYS.map((key) => (
                          <div key={key} className="flex items-center justify-between rounded border px-2 py-1 bg-white/30 dark:bg-slate-800/40">
                            <span className="text-[11px] font-medium">{key}</span>
                            <span className="text-[11px]">{getTiming(day, key)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      <p className="text-xs text-muted-foreground hidden">
        Future idea: once you add user accounts, you can track whether the user has prayed all 5 salah for each Ramzan day and show a simple checklist here, stored in your backend.
      </p>
    </main>
  );
}