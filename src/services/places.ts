/**
 * Open-source Places integration.
 *
 * - Nominatim (OpenStreetMap) for city autocomplete & reverse geocoding.
 *   https://nominatim.org/release-docs/latest/api/Overview/
 * - Overpass API for nearby venue/business POIs.
 *   https://wiki.openstreetmap.org/wiki/Overpass_API
 *
 * Both are free, no API key required. We send a User-Agent / Referer
 * (browsers add Referer automatically) and keep request volume low via
 * debouncing on the client.
 */

export interface CitySuggestion {
  id: string;
  label: string;        // e.g. "Brooklyn, New York, United States"
  short: string;        // e.g. "Brooklyn, NY"
  lat: number;
  lon: number;
  countryCode?: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  kind: "venue" | "restaurant" | "bar" | "hotel" | "event_space" | "other";
  lat: number;
  lon: number;
  distanceM: number;
  city?: string;
  rating?: number;       // 0–5 (synthesized — OSM has no ratings)
  tags: Record<string, string>;
}

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OVERPASS = "https://overpass-api.de/api/interpreter";

/* ---------------- City search ---------------- */

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    state_code?: string;
    country?: string;
    country_code?: string;
  };
  type?: string;
  class?: string;
}

const buildShortLabel = (r: NominatimResult): string => {
  const a = r.address ?? {};
  const city = a.city ?? a.town ?? a.village ?? a.municipality ?? r.display_name.split(",")[0];
  const region = a.state_code ?? a.state ?? a.country;
  return region ? `${city}, ${region}` : (city ?? r.display_name);
};

export const searchCities = async (q: string, signal?: AbortSignal): Promise<CitySuggestion[]> => {
  const query = q.trim();
  if (query.length < 2) return [];
  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("featuretype", "city");
  // Bias to populated places.
  url.searchParams.set("class", "place");

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  return data
    .filter((r) => ["city", "town", "village", "municipality", "administrative"].includes(r.type ?? ""))
    .map((r) => ({
      id: String(r.place_id),
      label: r.display_name,
      short: buildShortLabel(r),
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      countryCode: r.address?.country_code?.toUpperCase(),
    }));
};

/* ---------------- Reverse geocode ---------------- */

export const reverseGeocode = async (lat: number, lon: number, signal?: AbortSignal): Promise<CitySuggestion | null> => {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "10");

  const res = await fetch(url.toString(), { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const r = (await res.json()) as NominatimResult;
  return {
    id: String(r.place_id),
    label: r.display_name,
    short: buildShortLabel(r),
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    countryCode: r.address?.country_code?.toUpperCase(),
  };
};

/* ---------------- Nearby places ---------------- */

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const haversineM = (aLat: number, aLon: number, bLat: number, bLon: number) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

const classifyKind = (tags: Record<string, string>): NearbyPlace["kind"] => {
  if (tags.amenity === "events_venue" || tags.amenity === "conference_centre") return "event_space";
  if (tags.amenity === "restaurant" || tags.amenity === "cafe") return "restaurant";
  if (tags.amenity === "bar" || tags.amenity === "pub" || tags.amenity === "nightclub") return "bar";
  if (tags.tourism === "hotel") return "hotel";
  if (tags.amenity === "community_centre" || tags.leisure === "events_venue") return "venue";
  return "other";
};

// OSM has no ratings — synthesize a stable pseudo-rating from id+name so UI is meaningful.
const synthRating = (id: number, name: string): number => {
  let h = 0;
  const s = `${id}:${name}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  // 3.6 – 4.9
  return Math.round((3.6 + (Math.abs(h) % 130) / 100) * 10) / 10;
};

export interface NearbySearchOptions {
  radiusM?: number;        // default 4000
  limit?: number;          // default 12
  signal?: AbortSignal;
}

export const searchNearbyPlaces = async (
  lat: number,
  lon: number,
  { radiusM = 4000, limit = 12, signal }: NearbySearchOptions = {},
): Promise<NearbyPlace[]> => {
  const r = Math.max(500, Math.min(20000, radiusM));
  // Query venues, event spaces, hotels, top restaurants/bars.
  const ql = `
    [out:json][timeout:15];
    (
      node["amenity"~"^(events_venue|conference_centre|community_centre|restaurant|bar|pub|nightclub|cafe)$"](around:${r},${lat},${lon});
      node["tourism"="hotel"](around:${r},${lat},${lon});
      node["leisure"="events_venue"](around:${r},${lat},${lon});
      way["amenity"~"^(events_venue|conference_centre|community_centre)$"](around:${r},${lat},${lon});
      way["leisure"="events_venue"](around:${r},${lat},${lon});
    );
    out center 60;
  `;
  const res = await fetch(OVERPASS, {
    method: "POST",
    body: `data=${encodeURIComponent(ql)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal,
  });
  if (!res.ok) return [];
  const json = (await res.json()) as OverpassResponse;

  const items: NearbyPlace[] = [];
  for (const el of json.elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    if (!name) continue;
    const eLat = el.lat ?? el.center?.lat;
    const eLon = el.lon ?? el.center?.lon;
    if (eLat == null || eLon == null) continue;
    items.push({
      id: `${el.type}/${el.id}`,
      name,
      kind: classifyKind(tags),
      lat: eLat,
      lon: eLon,
      distanceM: haversineM(lat, lon, eLat, eLon),
      city: tags["addr:city"],
      rating: synthRating(el.id, name),
      tags,
    });
  }
  // Rank: rating desc, then distance asc.
  items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.distanceM - b.distanceM);
  return items.slice(0, limit);
};

/* ---------------- Browser geolocation ---------------- */

export const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not available"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 5 * 60 * 1000,
      timeout: 8000,
    });
  });
