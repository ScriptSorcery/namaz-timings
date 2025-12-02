# Namaz Timings

A small React + TypeScript + Vite app to show Islamic prayer times using:
- Aladhan (prayer times) — https://aladhan.com
- OpenStreetMap / Nominatim (geocoding & reverse-geocoding)

This repository is wired with components for:
- Location selection (search suggestions, manual input, "use current location")
- Theme toggle (light / dark / system)
- PrayerTimes display (Aladhan API wrappers)

## Prerequisites
- Node runtime alternative: Bun (recommended by you) — https://bun.sh
- Git
- A modern browser

## Quick start (Bun)
1. Install dependencies
   ```bash
   bun install
   ```

2. Start dev server (runs the "dev" script from package.json)
   ```bash
   bun run dev
   ```

3. Build for production
   ```bash
   bun run build
   ```

4. Preview production build
   ```bash
   bun run preview
   ```

(If your package.json uses different script names, run them with `bun run <script>`.)

## Project layout (important files)
- `src/`
  - `api/prayerApi.ts` — wrappers for Aladhan endpoints (timings, calendar, by city/address)
  - `components/`
    - `layout/Header.tsx`
    - `layout/Footer.tsx`
    - `layout/ThemeToggle.tsx`
    - `location/LocationDisplay.tsx` — main location control (edit/search/use current)
    - `location/LocationSearch.tsx` — Nominatim-backed search + suggestion list
    - `prayer/PrayerTimes.tsx` — requests Aladhan API and renders timings
  - `App.tsx` — app wiring (Header ↔ PrayerTimes ↔ Footer)

## APIs and usage notes
- Aladhan: no API key required for basic timing endpoints. See `src/api/prayerApi.ts` for helpers.
- Nominatim (OpenStreetMap): used for search & reverse-geocoding. Nominatim enforces rate limits and usage policy:
  - Include a meaningful User-Agent header (replace the placeholder string in the code with your app name and contact).
  - Debounce search requests and use AbortController to cancel in-flight requests (already implemented).
  - Avoid aggressive polling or automated bulk geocoding.

## Behavioral notes
- "Use Current Location" requests browser geolocation once and performs a single reverse-geocode call; in-flight requests are aborted when necessary to avoid repeated calls.
- Location search is debounced (300ms) and limited to a small number of results to stay within Nominatim limits.
- ThemeToggle saves preference to localStorage and supports "system" fallback.

## Troubleshooting
- If you see repeated network requests on reverse-geocoding: ensure the component uses AbortController and does not trigger onChange in an uncontrolled loop. The code in `src/components/location/LocationDisplay.tsx` should call onChange only when saving or when "Use Current Location" completes.
- If search returns empty results or CORS errors: verify network access and that Nominatim service is reachable. For production, consider using a paid geocoding provider if throughput is high.

## Development tips
- Replace the placeholder User-Agent in Nominatim requests with something like:
  `"NamazTimings/1.0 (https://yourdomain.example; contact@domain.example)"`
- Extend PrayerTimes to compute "next prayer" and timezone-aware displays.

## Contributing
- Open issues or PRs. Keep changes small and focused.

## License
- Add a LICENSE file appropriate to your project (MIT recommended for starters).

## Useful links
- Aladhan API docs — https://aladhan.com/prayer-times-api
- Nominatim usage policy — https://operations.osmfoundation.org/policies/nominatim/
- Bun — https://bun.sh
- Vite — https://vitejs.dev
- React — https://reactjs.org
