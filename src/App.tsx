import { Routes, Route } from 'react-router'
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import SettingsPage from './pages/SettingsPage';
import TodayPage from './pages/TodayPage';
import AboutPage from './pages/AboutPage';
import { RamzanCalendarPage } from './pages/RamzanCalendarPage';

export default function App() {
  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-4 pb-8">
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/ramzan" element={<RamzanCalendarPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
  );
}
