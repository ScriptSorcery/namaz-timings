import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useLocation } from "../../context/LocationContext";
import { toast } from "sonner";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
};

export function LocationSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const { setLocation } = useLocation();

  const listRef = useRef<HTMLUListElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    // reset when query cleared
    if (!query.trim()) {
      setSuggestions([]);
      setError(null);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    // debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      fetchSuggestions(query.trim());
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchSuggestions = async (q: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        q
      )}&addressdetails=1&limit=6`;
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          "Accept-Language": "en",
          "User-Agent": "namaz-timings-app/1.0 (your-email-or-domain)",
        },
      });
      if (!res.ok) throw new Error("Search failed");
      const json = (await res.json()) as NominatimResult[];
      setSuggestions(json ?? []);
      setActiveIndex(json.length ? 0 : -1);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError("Search failed. Try again.");
      setSuggestions([]);
      setActiveIndex(-1);
    } finally {
      setLoading(false);
    }
  };

  const choose = (item: NominatimResult) => {
    // prefer using location context helper; pass display_name and coordinates
    setLocation?.({
      // some LocationContext implementations accept string; others accept object.
      // pass an object with common fields — context can decide what to do.
      name: item.display_name,
      city: item.address?.city || item.address?.town || item.address?.village || undefined,
      region: item.address?.state || item.address?.region || undefined,
      country: item.address?.country || undefined,
      lat: Number(item.lat),
      lon: Number(item.lon),
    } as any);
    // clear suggestions but keep query as selected label
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // if there is an active suggestion, choose it; otherwise fallback to name search
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      choose(suggestions[activeIndex]);
    } else {
      setLocation?.(query.trim() as any);
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit(e as any);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      scrollActiveIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      scrollActiveIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) choose(suggestions[activeIndex]);
      else handleSubmit(e as any);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  const scrollActiveIntoView = () => {
    requestAnimationFrame(() => {
      const ul = listRef.current;
      if (!ul) return;
      const item = ul.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    });
  };

  return (
    <Card className="p-3 space-y-2" aria-live="polite">
      <form onSubmit={handleSubmit} className="space-y-2" role="search" aria-label="Search location">
        <Label htmlFor="location-search">Search location</Label>
        <div className="relative">
          <Input
            id="location-search"
            placeholder="City, area, or address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            aria-autocomplete="list"
            aria-controls="location-suggestions"
            aria-activedescendant={
              activeIndex >= 0 && suggestions[activeIndex] ? `loc-${suggestions[activeIndex].place_id}` : undefined
            }
          />
          {loading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500">Searching…</div>
          )}
        </div>
      </form>

      {/* {error && <div className="text-sm text-red-600">{error}</div>} */}
      {
        error && toast.error(error)
      }

      {suggestions.length > 0 && (
        <ul
          id="location-suggestions"
          ref={listRef}
          role="listbox"
          aria-label="Location suggestions"
          className="max-h-56 overflow-auto -mx-3 px-3 py-2 space-y-1"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          {suggestions.map((s, i) => {
            const isActive = i === activeIndex;
            const place = s;
            const title = place.display_name.split(",").slice(0, 2).join(", ");
            const subtitleParts = [];
            if (place.address?.state) subtitleParts.push(place.address.state);
            if (place.address?.country) subtitleParts.push(place.address.country);
            const subtitle = subtitleParts.join(", ");
            return (
              <li
                key={place.place_id}
                id={`loc-${place.place_id}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(ev) => {
                  // prevent blur before click
                  ev.preventDefault();
                }}
                onClick={() => choose(place)}
                className={`p-2 rounded-md cursor-pointer flex items-start gap-3 ${
                  isActive ? "bg-sky-100 ring-1 ring-sky-200" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{title}</div>
                  {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
                </div>
                <div className="text-xs text-slate-400 tabular-nums">
                  {Number(place.lat).toFixed(2)}, {Number(place.lon).toFixed(2)}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !suggestions.length && query.trim().length >= 2 && !error && (
        <div className="text-sm text-slate-500">No results. Try a different name or be more specific.</div>
      )}
    </Card>
  );
}
