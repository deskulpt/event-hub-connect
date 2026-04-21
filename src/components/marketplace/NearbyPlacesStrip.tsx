import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, Locate, Loader2, Sparkles } from "lucide-react";
import { BentoCard, GradientOrb } from "@/components/shell/Bento";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCurrentPosition,
  reverseGeocode,
  searchNearbyPlaces,
  type NearbyPlace,
} from "@/services/places";

interface Coords { lat: number; lon: number; label?: string }

const KIND_LABEL: Record<NearbyPlace["kind"], string> = {
  event_space: "Event space",
  venue: "Venue",
  hotel: "Hotel",
  restaurant: "Restaurant",
  bar: "Bar",
  other: "Place",
};

export const NearbyPlacesStrip = () => {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [permError, setPermError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const requestLocation = async () => {
    setRequesting(true);
    setPermError(null);
    try {
      const pos = await getCurrentPosition();
      const c: Coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setCoords(c);
      try {
        const r = await reverseGeocode(c.lat, c.lon);
        if (r) setCoords({ ...c, label: r.short });
      } catch { /* noop */ }
    } catch {
      setPermError("Location unavailable. Allow access to see top venues near you.");
    } finally {
      setRequesting(false);
    }
  };

  // Auto-request once on mount; users can re-trigger via button if denied.
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placesQ = useQuery({
    queryKey: ["nearby-places", coords?.lat, coords?.lon],
    queryFn: () => searchNearbyPlaces(coords!.lat, coords!.lon, { radiusM: 5000, limit: 10 }),
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <BentoCard className="relative overflow-hidden p-4">
      <GradientOrb color="tertiary" className="-top-16 -right-10 h-48 w-48" />
      <div className="relative space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="font-display text-base font-semibold">Top places near you</h2>
            <p className="text-xs text-muted-foreground">
              {coords?.label
                ? <>Around <span className="font-medium text-foreground">{coords.label}</span> · OpenStreetMap</>
                : "Live picks from OpenStreetMap"}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={requestLocation} disabled={requesting}>
            {requesting ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Locate className="mr-1 h-3.5 w-3.5" />}
            {coords ? "Refresh" : "Use my location"}
          </Button>
        </div>

        {permError && !coords && (
          <p className="text-xs text-muted-foreground">{permError}</p>
        )}

        {coords && placesQ.isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Scanning venues nearby…
          </div>
        )}

        {coords && !placesQ.isLoading && (placesQ.data?.length ?? 0) === 0 && (
          <p className="text-xs text-muted-foreground">No event venues found within 5 km. Try expanding your search.</p>
        )}

        {(placesQ.data?.length ?? 0) > 0 && (
          <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
            {placesQ.data!.map((p) => (
              <article
                key={p.id}
                className="snap-start shrink-0 basis-[240px] rounded-2xl border border-border/60 bg-background/80 p-3 shadow-soft backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{p.name}</h3>
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    {p.rating?.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="tabular-nums">{(p.distanceM / 1000).toFixed(1)} km</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <Badge variant="outline" className="text-[10px] capitalize">{KIND_LABEL[p.kind]}</Badge>
                  {p.tags.cuisine && <Badge variant="outline" className="text-[10px] capitalize">{p.tags.cuisine.split(";")[0]}</Badge>}
                </div>
                <a
                  href={`https://www.openstreetmap.org/${p.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <Sparkles className="h-3 w-3" /> View on map →
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </BentoCard>
  );
};
