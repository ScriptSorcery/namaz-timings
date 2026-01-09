function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">About NamazNow</h1>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Your complete Islamic companion for prayer times, Ramzan calendar, and Zakaat calculations
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-base text-muted-foreground leading-relaxed">
          NamazNow is a comprehensive web application designed to help Muslims stay connected with their religious obligations. 
          Using your device's location and real-time data from the Aladhan prayer times API, we provide accurate prayer schedules, 
          Ramzan timings, and Zakaat calculations tailored specifically to where you are.
        </p>
      </div>

      {/* Core Features */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <span className="text-2xl">📍</span> Location-Based Accuracy
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              Automatically detects your location or allows manual search to provide the most accurate prayer times for your specific area.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
              <span className="text-2xl">⏰</span> Live Prayer Countdown
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
              Real-time countdown to the next prayer helps you stay prepared and never miss a prayer time.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <span className="text-2xl">🕌</span> Complete Daily Schedule
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
              View all five daily prayers with precise timings: Fajr, Dhuhr, Asr, Maghrib, and Isha, plus Sunrise time.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
              <span className="text-2xl">📱</span> Mobile Optimized
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              Clean, intuitive interface that works seamlessly on any device - phone, tablet, or desktop.
            </p>
          </div>
        </div>
      </div>

      {/* Ramzan Features */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">🌙 Ramzan Calendar</h2>
        <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800">
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            Plan your blessed month of Ramzan with our comprehensive calendar featuring:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Sehri & Iftar Times:</strong> Precise timings for pre-dawn meal and breaking fast</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Full Month View:</strong> Complete 30-day calendar at a glance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Day Tracking:</strong> Know which Ramzan day it is with current day highlighting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Location-Aware:</strong> All timings adjusted to your specific location</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Zakaat Calculator */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">💰 Zakaat Calculator</h2>
        <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800">
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            Calculate your annual Zakaat obligation with ease using our comprehensive calculator:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Multiple Asset Types:</strong> Cash, savings, gold, silver, investments, and business assets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Liability Deduction:</strong> Subtract loans and debts for accurate calculation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Nisab Threshold:</strong> Automatically checks if you meet the minimum requirement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Instant Results:</strong> Get your Zakaat amount calculated at 2.5% of eligible wealth</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Simple Interface:</strong> Easy-to-use form with clear instructions</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Additional Features */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">✨ Additional Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm"><span className="font-semibold">🌓 Dark Mode:</span> Easy on the eyes for night-time use</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm"><span className="font-semibold">🪙 Live Gold Prices:</span> Real-time gold market rates for Zakaat calculation</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm"><span className="font-semibold">⚪ Live Silver Prices:</span> Current silver prices for accurate Nisab threshold</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm"><span className="font-semibold">💱 Live Currency Rates:</span> USD, INR, and EUR exchange rates updated in real-time</p>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">📊 Data Sources</h2>
        <div className="p-6 rounded-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 border border-slate-200 dark:border-slate-800">
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            NamazNow relies on trusted and accurate data sources to provide you with reliable information:
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">🕌</span>
              <span>
                <strong>Prayer Times:</strong>{" "}
                <a href="https://aladhan.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  Aladhan API
                </a>
                {" "}- Islamic prayer times API based on multiple calculation methods and juristic schools
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">🗺️</span>
              <span>
                <strong>Location Data:</strong>{" "}
                <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  OpenStreetMap
                </a>
                {" "}and{" "}
                <a href="https://nominatim.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  Nominatim
                </a>
                {" "}- Accurate geocoding and reverse geocoding services
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t space-y-3">
        <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1">
          Made with ❤️ to help you stay connected with your daily prayers and Islamic obligations
        </p>
      </div>
    </div>
  );
}

export default AboutPage;