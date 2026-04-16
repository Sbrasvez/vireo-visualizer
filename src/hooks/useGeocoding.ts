import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  region?: string;
}

let cachedToken: string | null = null;

async function getToken() {
  if (cachedToken) return cachedToken;
  const { data, error } = await supabase.functions.invoke("get-mapbox-token");
  if (error) throw error;
  cachedToken = data?.token as string;
  return cachedToken;
}

export function useGeocoding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = async (query: string): Promise<GeocodeResult | null> => {
    if (!query.trim()) return null;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query,
      )}.json?access_token=${token}&country=IT&language=it&limit=1`;
      const res = await fetch(url);
      const json = await res.json();
      const feat = json?.features?.[0];
      if (!feat) {
        setError("Nessun risultato");
        return null;
      }
      const [lng, lat] = feat.center;
      return { name: feat.place_name, lat, lng, region: feat.context?.find((c: any) => c.id?.startsWith("region"))?.text };
    } catch (e: any) {
      setError(e.message || "Errore geocoding");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { geocode, loading, error };
}
