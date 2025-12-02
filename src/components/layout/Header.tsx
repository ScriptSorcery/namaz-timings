import LocationDisplay from "../location/LocationDisplay";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto max-w-2xl px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-base sm:text-lg">
            Namaz Times
          </div>
          <div className="sm:hidden">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <LocationDisplay className="flex-1 min-w-0" />
          <div className="hidden sm:block shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
