import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils"; // if you don't have this, replace cn(...) with just className
import { useLocation } from "../../context/LocationContext";
import { toast } from "sonner";

type Props = {
  className?: string;
};

type Suggestion = {
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
  label: string;
};

export default function LocationDisplay({ className }: Props) {
  const { location, setLocation } = useLocation();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // focus search input when dialog opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  // cleanup pending fetch on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const resetDialogState = () => {
    setError(null);
    setResults([]);
    setQuery("");
    setLoading(false);
    abortRef.current?.abort();
  };

  const handleDialogOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      resetDialogState();
    }
  };

  const selectLocation = (newLoc: Suggestion) => {
    setLocation({
      city: newLoc.city,
      region: newLoc.region,
      country: newLoc.country,
      lat: newLoc.lat,
      lon: newLoc.lon,
    });
    handleDialogOpenChange(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // abort previous
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        trimmed
      )}&addressdetails=1&limit=5`;

      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          "Accept-Language": "en",
        },
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setResults([]);
        setError("No results found for that query.");
        return;
      }

      const mapped: Suggestion[] = data.map((item: any) => {
        const address = item.address ?? {};
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.hamlet ||
          address.county;
        const region = address.state || address.region;
        const country = address.country;
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        return {
          city,
          region,
          country,
          lat,
          lon,
          label:
            item.display_name ??
            [city, region, country].filter(Boolean).join(", "),
        };
      });

      setResults(mapped);
      setError(null);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError("Failed to search for that location.");
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser.");
      return;
    }

    // abort previous
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
            latitude
          )}&lon=${encodeURIComponent(longitude)}&addressdetails=1`;

          const res = await fetch(url, {
            signal: ctrl.signal,
            headers: {
              "Accept-Language": "en",
            },
          });

          if (!res.ok) throw new Error("Reverse geocode failed");

          const data = await res.json();
          const address = data.address ?? {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            address.county;
          const region = address.state || address.region;
          const country = address.country;

          const newLoc: Suggestion = {
            city,
            region,
            country,
            lat: latitude,
            lon: longitude,
            label: [city, region, country].filter(Boolean).join(", "),
          };

          selectLocation(newLoc);
          setLoading(false);
        } catch (err: any) {
          if (err?.name === "AbortError") return;
          setError("Failed to reverse geocode location.");
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setError(err?.message || "Unable to get location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 }
    );
  };

  const displayLine =
    location?.city || location?.region || location?.country
      ? [location?.city, location?.region, location?.country]
          .filter(Boolean)
          .join(", ")
      : "Select location";

  const coordsLine =
    location?.lat != null && location?.lon != null
      ? `${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`
      : "";

  return (
    <div className={cn("w-full", className)} aria-live="polite">
      {/* Compact header row */}
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{displayLine}</div>
          {coordsLine && (
            <div className="text-xs text-muted-foreground font-mono truncate">
              {coordsLine}
            </div>
          )}
        </div>
        <div className="ml-auto flex gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={useCurrentLocation}
            disabled={loading}
          >
            {loading ? "Locating…" : "Use Current"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDialogOpenChange(true)}
          >
            Change
          </Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Change location</DialogTitle>
            <DialogDescription>
              Search for your city or use your current location to fetch accurate
              namaz timings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearch} className="space-y-3 py-2">
            <div className="flex gap-2">
              <Input
                ref={searchInputRef}
                placeholder="Search city, area, or address"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "Searching…" : "Search"}
              </Button>
            </div>
          </form>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useCurrentLocation}
              disabled={loading}
            >
              {loading ? "Locating…" : "Use Current Location"}
            </Button>
          </div>

          {error && (
            <div className="text-xs text-red-500 pt-1">{error}</div>
          )}
          {
            error && toast.error(error)
          }

          {results.length > 0 && (
            <div className="mt-2 border rounded-md max-h-56 overflow-y-auto text-sm">
              {results.map((r, idx) => (
                <button
                  key={`${r.label}-${idx}`}
                  type="button"
                  onClick={() => selectLocation(r)}
                  className="w-full text-left px-3 py-2 hover:bg-muted focus:outline-none"
                >
                  <div className="font-medium">
                    {r.city || r.region || r.country || r.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.label}
                  </div>
                </button>
              ))}
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
