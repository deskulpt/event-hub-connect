import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Compass, MapPin, Search, Sparkles, Building2, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { BentoCard, GradientOrb } from "@/components/shell/Bento";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listEvents } from "@/services/events";
import { listPublishedVendors, listPublishedVenues } from "@/services/listings";
import { VENDOR_CATEGORIES, type VendorCategory } from "@/types/listing";
import { formatCents, scoreVendorFit, scoreVenueFit } from "@/lib/fitScore";
import { FitRing } from "@/components/marketplace/FitRing";
import { ListingCover } from "@/components/marketplace/ListingCover";
import { NearbyPlacesStrip } from "@/components/marketplace/NearbyPlacesStrip";
import { CityAutocomplete } from "@/components/CityAutocomplete";

const initials = (s: string) => s.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

export default function Discover() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"venue" | "pro">("venue");
  const [city, setCity] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [category, setCategory] = useState<VendorCategory | "all">("all");
  const [query, setQuery] = useState("");

  const eventsQ = useQuery({ queryKey: ["events", user?.id], queryFn: listEvents, enabled: !!user });
  const activeEvent = useMemo(() => {
    const list = eventsQ.data ?? [];
    return list.find((e) => e.status === "planning") ?? list.find((e) => e.status === "draft") ?? list[0] ?? null;
  }, [eventsQ.data]);

  const venuesQ = useQuery({
    queryKey: ["venues", { city, capacity, query }],
    queryFn: () =>
      listPublishedVenues({ city: city || undefined, capacity: capacity ? Number(capacity) : undefined, query: query || undefined }),
    enabled: tab === "venue",
  });

  const vendorsQ = useQuery({
    queryKey: ["vendors", { city, category, query }],
    queryFn: () =>
      listPublishedVendors({
        city: city || undefined,
        category: category === "all" ? undefined : category,
        query: query || undefined,
      }),
    enabled: tab === "pro",
  });

  const rankedVenues = useMemo(() => {
    const rows = venuesQ.data ?? [];
    return rows
      .map((v) => ({ row: v, fit: scoreVenueFit(activeEvent, v) }))
      .sort((a, b) => b.fit.total - a.fit.total);
  }, [venuesQ.data, activeEvent]);

  const rankedVendors = useMemo(() => {
    const rows = vendorsQ.data ?? [];
    return rows
      .map((v) => ({ row: v, fit: scoreVendorFit(activeEvent, v) }))
      .sort((a, b) => b.fit.total - a.fit.total);
  }, [vendorsQ.data, activeEvent]);

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Marketplace"
        title="Discover"
        subtitle={
          activeEvent
            ? `Ranked against your event "${activeEvent.title}" — Fit Score blends city, capacity, vibe, and budget.`
            : "Search venues and pros. Create an event to unlock Fit Score ranking."
        }
        primaryCta={
          <Button asChild size="sm">
            <Link to="/app/marketplace/saved">View shortlist</Link>
          </Button>
        }
      />

      <BentoCard className="relative overflow-hidden p-4">
        <GradientOrb color="primary" className="-top-16 -right-10 h-48 w-48" />
        <div className="relative grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="space-y-1.5">
            <Label htmlFor="q" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="q" placeholder="Name" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">City</Label>
            <CityAutocomplete id="city" value={city} onChange={(v) => setCity(v)} placeholder="Any city" />
          </div>
          {tab === "venue" ? (
            <div className="space-y-1.5">
              <Label htmlFor="cap" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Min capacity</Label>
              <Input
                id="cap"
                type="number"
                min={0}
                placeholder="Guests"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="cat" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as VendorCategory | "all")}>
                <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {VENDOR_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </BentoCard>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "venue" | "pro")} className="w-full">
        <TabsList>
          <TabsTrigger value="venue" className="gap-1.5"><Building2 className="h-3.5 w-3.5" />Venues</TabsTrigger>
          <TabsTrigger value="pro" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" />Pros & Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="venue" className="space-y-3 pt-3">
          {venuesQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading venues…</p>
          ) : rankedVenues.length === 0 ? (
            <EmptyState
              icon={<Compass className="h-5 w-5 text-primary-foreground" />}
              title="No venues match"
              description="Try a different city or clear filters. Published venues from owners will show up here."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rankedVenues.map(({ row, fit }) => (
                <BentoCard key={row.id} glow interactive className="overflow-hidden p-0">
                  <Link to={`/app/marketplace/venue/${row.id}`} className="block">
                    <ListingCover seed={row.id} initials={initials(row.name)} photoUrl={row.photo_url} />
                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <h3 className="truncate font-display text-base font-semibold">{row.name}</h3>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {row.city ?? "—"}
                          </p>
                        </div>
                        <FitRing score={fit.total} size={48} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-2">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Capacity</div>
                          <div className="font-medium tabular-nums">{row.capacity_min ?? 0}–{row.capacity_max ?? 0}</div>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-2">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
                          <div className="font-medium tabular-nums">{formatCents(row.base_price_cents)}</div>
                        </div>
                      </div>
                      {row.vibe_tags && row.vibe_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {row.vibe_tags.slice(0, 4).map((t) => (
                            <Badge key={t} variant="outline" className="text-[10px] capitalize">{t}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          {fit.city ? "city✓" : ""} {fit.capacity ? "cap✓" : ""} {fit.vibe ? "vibe✓" : ""}
                        </span>
                        <span className="font-medium text-primary">View →</span>
                      </div>
                    </div>
                  </Link>
                </BentoCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pro" className="space-y-3 pt-3">
          {vendorsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading pros…</p>
          ) : rankedVendors.length === 0 ? (
            <EmptyState
              icon={<Compass className="h-5 w-5 text-primary-foreground" />}
              title="No pros match"
              description="Try another category or city."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rankedVendors.map(({ row, fit }) => (
                <BentoCard key={row.id} glow interactive className="overflow-hidden p-0">
                  <Link to={`/app/marketplace/pro/${row.id}`} className="block">
                    <ListingCover seed={row.id} initials={initials(row.name)} photoUrl={row.photo_url} />
                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <h3 className="truncate font-display text-base font-semibold">{row.name}</h3>
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{row.category}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {row.city ?? "—"}</span>
                          </p>
                        </div>
                        <FitRing score={fit.total} size={48} />
                      </div>
                      <div className="rounded-lg border border-border/60 bg-muted/30 p-2 text-xs">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
                        <div className="font-medium tabular-nums">{formatCents(row.base_price_cents)}</div>
                      </div>
                      {row.vibe_tags && row.vibe_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {row.vibe_tags.slice(0, 4).map((t) => (
                            <Badge key={t} variant="outline" className="text-[10px] capitalize">{t}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Fit ranked</span>
                        <span className="font-medium text-primary">View →</span>
                      </div>
                    </div>
                  </Link>
                </BentoCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
