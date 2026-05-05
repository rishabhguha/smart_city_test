"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Input } from "@/components/ui/input";

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void;
  defaultLat?: number;
  defaultLng?: number;
}

export function LocationPicker({ onLocationChange, defaultLat = 41.1306, defaultLng = -85.1286 }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<{ place_name: string; center: [number, number] }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Keep ref current so event handlers always call the latest callback without being deps.
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  });

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [defaultLng, defaultLat],
      zoom: 13,
    });

    marker.current = new mapboxgl.Marker({ draggable: true, color: "#2563eb" })
      .setLngLat([defaultLng, defaultLat])
      .addTo(map.current);

    const reverseGeocode = async (lng: number, lat: number) => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`
        );
        const data = await res.json();
        const place = data.features?.[0]?.place_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        onLocationChangeRef.current(lat, lng, place);
        setSearch(place);
      } catch {
        onLocationChangeRef.current(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    };

    marker.current.on("dragend", () => {
      const { lat, lng } = marker.current!.getLngLat();
      reverseGeocode(lng, lat);
    });

    map.current.on("click", (e) => {
      marker.current!.setLngLat(e.lngLat);
      reverseGeocode(e.lngLat.lng, e.lngLat.lat);
    });

    reverseGeocode(defaultLng, defaultLat);

    return () => {
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(async (value: string) => {
    setSearch(value);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=5&types=address,poi`
      );
      const data = await res.json();
      setSuggestions(data.features ?? []);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: { place_name: string; center: [number, number] }) => {
      const [lng, lat] = suggestion.center;
      map.current?.flyTo({ center: [lng, lat], zoom: 15 });
      marker.current?.setLngLat([lng, lat]);
      onLocationChange(lat, lng, suggestion.place_name);
      setSearch(suggestion.place_name);
      setShowSuggestions(false);
      setSuggestions([]);
    },
    [onLocationChange]
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search for an address..."
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((s) => (
              <li
                key={s.place_name}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                onMouseDown={() => selectSuggestion(s)}
              >
                {s.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div ref={mapContainer} className="w-full h-64 rounded-md border" />
      <p className="text-xs text-gray-500">Click on the map or drag the pin to set the exact location.</p>
    </div>
  );
}
