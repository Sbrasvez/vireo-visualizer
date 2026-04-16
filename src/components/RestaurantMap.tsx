import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin } from "lucide-react";

export interface RestaurantMarker {
  id: string;
  name: string;
  city: string;
  rating: number;
  price: string;
  img: string;
  available: boolean;
  lng: number;
  lat: number;
}

interface RestaurantMapProps {
  restaurants: RestaurantMarker[];
  activeId?: string | null;
  onMarkerClick?: (id: string) => void;
  origin?: { lat: number; lng: number } | null;
}

export default function RestaurantMap({ restaurants, activeId, onMarkerClick, origin }: RestaurantMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Init map
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("get-mapbox-token");
        if (fnError) throw fnError;
        if (cancelled || !mapContainer.current) return;
        const token = data?.token;
        if (!token) throw new Error("Token mancante");

        mapboxgl.accessToken = token;
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [12.5, 42.5], // Italy center
          zoom: 5.2,
          attributionControl: false,
        });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new mapboxgl.AttributionControl({ compact: true }));
        mapRef.current = map;
        map.on("load", () => setLoading(false));
      } catch (e) {
        console.error("Mapbox init error", e);
        setError("Impossibile caricare la mappa");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading || error) return;

    // clear old
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const bounds = new mapboxgl.LngLatBounds();

    restaurants.forEach((r) => {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `${r.name}, ${r.city}`);
      el.className = "vireo-marker";
      el.innerHTML = `
        <span class="vireo-marker-dot ${r.available ? "is-available" : "is-busy"}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.4c1.7 8.7-1.4 14.5-8.2 17.6Z"/>
            <path d="M2 22c1.5-7 6-13 12-15"/>
          </svg>
        </span>
        <span class="vireo-marker-pulse"></span>
      `;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onMarkerClick?.(r.id);
      });

      const popupHtml = `
        <div class="vireo-popup">
          <div class="vireo-popup-img" style="background-image:url('${r.img}')"></div>
          <div class="vireo-popup-body">
            <div class="vireo-popup-title">${r.name}</div>
            <div class="vireo-popup-meta">
              <span>★ ${r.rating}</span>
              <span>·</span>
              <span>${r.city}</span>
              <span>·</span>
              <span>${r.price}</span>
            </div>
            <div class="vireo-popup-status ${r.available ? "ok" : "no"}">
              ${r.available ? "● Disponibile ora" : "○ Completo stasera"}
            </div>
            <button class="vireo-popup-cta" ${r.available ? "" : "disabled"}>
              ${r.available ? "Prenota live" : "Lista d'attesa"}
            </button>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 32, closeButton: false, maxWidth: "280px" }).setHTML(popupHtml);

      // anchor: "center" because the .vireo-marker box is 32x32 and we
      // visually anchor the dot's tip to the box center via CSS translate.
      // This makes Mapbox apply its translate to a stable square — no jitter on pan/zoom.
      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([r.lng, r.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current[r.id] = marker;
      bounds.extend([r.lng, r.lat]);
    });

    if (restaurants.length > 0) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 11, duration: 1200 });
    }
  }, [restaurants, loading, error, onMarkerClick]);

  // Active marker focus
  useEffect(() => {
    const map = mapRef.current;
    if (!map || activeId == null) return;
    const r = restaurants.find((x) => x.id === activeId);
    const marker = markersRef.current[activeId];
    if (!r || !marker) return;
    map.flyTo({ center: [r.lng, r.lat], zoom: 13, duration: 1000, essential: true });
  }, [activeId, restaurants]);

  // Origin pin (user's searched location)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading || error) return;
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    if (origin) {
      const el = document.createElement("div");
      el.className = "vireo-origin-pin";
      el.innerHTML = `<span class="vireo-origin-dot"></span><span class="vireo-origin-pulse"></span>`;
      originMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map);
      map.flyTo({ center: [origin.lng, origin.lat], zoom: 11, duration: 1200 });
    }
  }, [origin, loading, error]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-border/60 shadow-elegant bg-muted">
      <div ref={mapContainer} className="absolute inset-0" />
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Caricamento mappa…</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-card">
          <div className="flex flex-col items-center gap-2 text-muted-foreground text-center px-6">
            <MapPin className="size-6" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
