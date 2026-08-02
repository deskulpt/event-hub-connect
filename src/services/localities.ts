import { supabase } from "@/integrations/supabase/client";
import type { Locality } from "@/types/community";

export const listLocalities = async (): Promise<Locality[]> => {
  const { data, error } = await supabase
    .from("localities")
    .select("*")
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as Locality[];
};

const toRadians = (value: number) => (value * Math.PI) / 180;

export const distanceMiles = (
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number => {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
};

export const nearestLocality = (
  localities: Locality[],
  lat: number,
  lng: number,
): Locality | null => {
  const withCoords = localities.filter((l) => l.center_lat !== null && l.center_lng !== null);
  if (withCoords.length === 0) return null;
  return withCoords.reduce((best, current) => {
    const bestDistance = distanceMiles(lat, lng, best.center_lat as number, best.center_lng as number);
    const currentDistance = distanceMiles(lat, lng, current.center_lat as number, current.center_lng as number);
    return currentDistance < bestDistance ? current : best;
  });
};
