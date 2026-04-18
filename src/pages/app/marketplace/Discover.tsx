import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Compass, MapPin, Search, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listEvents } from "@/services/events";
import { listPublishedVendors, listPublishedVenues } from "@/services/listings";
import { VENDOR_CATEGORIES, type VendorCategory } from "@/types/listing";
import { formatCents, scoreVendorFit, scoreVenueFit } from "@/lib/fitScore";

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

      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <div className="space-y-1.5">
          <Label htmlFor="q">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input id="q" placeholder="Name" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Any city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        {tab === "venue" ? (
          <div className="space-y-1.5">
            <Label htmlFor="cap">Min capacity</Label>
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
            <Label htmlFor="cat">Category</Label>
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

      <Tabs value={tab} onValueChange={(v) => setTab(v as "venue" | "pro")} className="w-full">
        <TabsList>
          <TabsTrigger value="venue">Venues</TabsTrigger>
          <TabsTrigger value="pro">Pros & Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="venue" className="space-y-3 pt-3">
          {venuesQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading venues…</p>
          ) : rankedVenues.length === 0 ? (
            <EmptyState
              icon={<Compass className="h-5 w-5 text-primary" />}
              title="No venues match"
              description="Try a different city or clear filters. Published venues from owners will show up here."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rankedVenues.map(({ row, fit }) => (
                <Card key={row.id} className="overflow-hidden">
                  <CardHeader className="space-y-1.5 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{row.name}</CardTitle>
                      <Badge variant="secondary">Fit {fit.total}</Badge>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {row.city ?? "—"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between tabular-nums">
                      <span className="text-muted-foreground">Capacity</span>
                      <span>{row.capacity_min ?? 0}–{row.capacity_max ?? 0}</span>
                    </div>
                    <div className="flex justify-between tabular-nums">
                      <span className="text-muted-foreground">From</span>
                      <span>{formatCents(row.base_price_cents)}</span>
                    </div>
                    {row.vibe_tags && row.vibe_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {row.vibe_tags.slice(0, 4).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="justify-between gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/app/marketplace/venue/${row.id}`}>View</Link>
                    </Button>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" /> {fit.city ? "city✓" : ""} {fit.capacity ? "capacity✓" : ""}
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pro" className="space-y-3 pt-3">
          {vendorsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading pros…</p>
          ) : rankedVendors.length === 0 ? (
            <EmptyState
              icon={<Compass className="h-5 w-5 text-primary" />}
              title="No pros match"
              description="Try another category or city."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rankedVendors.map(({ row, fit }) => (
                <Card key={row.id} className="overflow-hidden">
                  <CardHeader className="space-y-1.5 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{row.name}</CardTitle>
                      <Badge variant="secondary">Fit {fit.total}</Badge>
                    </div>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{row.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {row.city ?? "—"}</span>
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between tabular-nums">
                      <span className="text-muted-foreground">From</span>
                      <span>{formatCents(row.base_price_cents)}</span>
                    </div>
                    {row.vibe_tags && row.vibe_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {row.vibe_tags.slice(0, 4).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/app/marketplace/pro/${row.id}`}>View</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
