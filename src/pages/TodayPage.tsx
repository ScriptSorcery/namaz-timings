import { NextPrayerCountdown } from "@/components/prayer/NextPrayerCountdown";
import { PrayerTimesCard } from "@/components/prayer/PrayerTimesCard";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/context/LocationContext";
import { getNearbyMosquesUrl } from "@/shared/shared";

function TodayPage() {
  const { location } = useLocation();

  return (
    <div className="container mx-auto max-w-2xl px-4 space-y-4">
      <div className="flex flex-col items-center sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <NextPrayerCountdown location={location ?? undefined} method={1} school={0} />
        </div>
        <Button
          className="w-full sm:w-auto whitespace-nowrap"
          onClick={() => {
            const lat = location?.lat ?? 0;
            const lon = location?.lon ?? 0;
            const url = getNearbyMosquesUrl(lat, lon);
            window.open(url, "_blank");
          }}
        >
          Find Mosques Nearby
        </Button>
      </div>
      <PrayerTimesCard location={location ?? undefined} method={1} school={0} />
    </div>
  );
}
export default TodayPage;