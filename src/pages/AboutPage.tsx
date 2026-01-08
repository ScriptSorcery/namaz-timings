function AboutPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">About Namaz Timings</h1>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
      </div>

      <p className="text-base text-muted-foreground leading-relaxed">
        NamazNow is a simple yet powerful web application designed to help you never miss your daily prayers. Using your device's location and real-time data from the Aladhan prayer times API, we provide accurate prayer schedules tailored specifically to where you are.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📍 Location-Based</h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Automatically detects your location to provide accurate prayer times for your area.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">⏰ Real-Time Updates</h3>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Stay updated with accurate prayer schedules throughout the day.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">🕌 Complete Schedule</h3>
          <p className="text-sm text-green-800 dark:text-green-200">
            View all five daily prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">📱 Simple & Fast</h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Clean, intuitive interface that works seamlessly on any device.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Made with ❤️ to help you stay connected with your daily prayers.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;