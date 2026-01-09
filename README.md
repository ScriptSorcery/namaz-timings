# NamazNow

A small React + TypeScript + Vite app to show Islamic prayer times using:
- Aladhan (prayer times) — https://aladhan.com
- OpenStreetMap / Nominatim (geocoding & reverse-geocoding)

This repository is wired with components for:
- Location selection (search suggestions, manual input, "use current location")
- Theme toggle (light / dark / system)
- PrayerTimes display (Aladhan API wrappers)

## Features

### 🕌 Prayer Times
- **Daily Prayer Schedules**: View accurate prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for any location worldwide
- **Next Prayer Countdown**: Real-time countdown timer showing time remaining until the next prayer
- **Multiple Calculation Methods**: Support for various Islamic calculation methods via Aladhan API

### 📍 Location Management
- **Smart Location Search**: Search for any city or address worldwide with autocomplete suggestions
- **Current Location Detection**: Automatically detect your location using browser geolocation
- **Manual Location Input**: Enter coordinates or addresses manually
- **Reverse Geocoding**: Automatically converts coordinates to readable location names

### 📅 Islamic Calendar Features
- **Ramzan Calendar**: Dedicated page for Ramadan timings and suhoor/iftar schedules
- **Monthly View**: View prayer times for entire months

### 💰 Zakat Calculator
- **Zakat Calculation Tools**: Dedicated page for calculating Zakat obligations

### ⚙️ Customization
- **Theme Toggle**: Switch between light, dark, and system-preferred themes
- **Settings Page**: Customize calculation methods, time formats, and other preferences
- **Persistent Preferences**: Settings saved to localStorage for consistent experience

### 📱 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Built with shadcn/ui components for a polished interface
- **Fast Performance**: Built with Vite for lightning-fast load times
- **Progressive Web App Ready**: Can be installed as a standalone app

### ℹ️ Additional Pages
- **About Page**: Information about the app and its data sources
- **Today View**: Quick access to today's prayer times and next prayer

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
