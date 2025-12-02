import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { NextPrayerCountdown } from "./components/prayer/NextPrayerCountdown";
import { PrayerTimesCard } from "./components/prayer/PrayerTimesCard";
import { useLocation } from "./context/LocationContext";

export default function App() {
  const { location } = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-4">
        <div className="container mx-auto max-w-2xl px-4 space-y-4">
          <NextPrayerCountdown location={location ?? undefined} method={1} school={0} />
          <PrayerTimesCard location={location ?? undefined} method={1} school={0} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
