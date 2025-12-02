import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Location = {
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

type LocationContextValue = {
  location: Location | null;
  setLocation: (loc: Location) => void;
  clearLocation: () => void;
};

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location | null>(null);

  // load once from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("namaz.location");
      if (saved) {
        setLocationState(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved location", e);
    }
  }, []);

  const setLocation = (loc: Location) => {
    setLocationState(loc);
    try {
      localStorage.setItem("namaz.location", JSON.stringify(loc));
    } catch (e) {
      console.error("Failed to save location", e);
    }
  };

  const clearLocation = () => {
    setLocationState(null);
    try {
      localStorage.removeItem("namaz.location");
    } catch {
      // ignore
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used inside a LocationProvider");
  }
  return ctx;
}
