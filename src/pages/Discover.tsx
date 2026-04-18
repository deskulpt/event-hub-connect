import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Filter } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VenueCard, ProCard } from "@/components/ListingCards";
import { EVENT_TYPES, EventType, MOCK_CATERERS, MOCK_PROS, MOCK_VENUES } from "@/data/mock";

const Discover = () => {
  const [params] = useSearchParams();
  const type = (params.get("type") as EventType) || "meetup";
  const guests = Number(params.get("guests") || 8);
  const city = params.get("city") || "";
  const date = params.get("date") || "";
  const initialTab = params.get("tab") || (type === "athome" ? "pros" : "venues");

  const venues = useMemo(
    () =>
      MOCK_VENUES.filter((v) => v.capacity >= guests).filter((v) =>
        city ? v.city.toLowerCase().includes(city.toLowerCase()) : true,
      ),
    [guests, city],
  );

  const eventTypeLabel = EVENT_TYPES.find((t) => t.id === type)?.label ?? "Event";

  return (
    <AppShell>
      <section className="border-b border-border bg-gradient-warm">
        <div className="container py-6 md:py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">{eventTypeLabel}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {guests} guests
                {city ? ` · ${city}` : ""}
                {date ? ` · ${new Date(date).toLocaleDateString()}` : ""}
              </p>
            </div>
            <Button variant="soft" size="sm">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-6">
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="h-11 w-full justify-start gap-1 rounded-xl bg-muted/70 p-1">
            <TabsTrigger value="venues" className="flex-1 rounded-lg">Venues</TabsTrigger>
            <TabsTrigger value="pros" className="flex-1 rounded-lg">Professionals</TabsTrigger>
            <TabsTrigger value="caterers" className="flex-1 rounded-lg">Caterers</TabsTrigger>
          </TabsList>

          <TabsContent value="venues" className="mt-6">
            {venues.length === 0 ? (
              <EmptyState message={`No venues yet for ${guests}+ guests${city ? ` in ${city}` : ""}.`} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {venues.map((v) => (
                  <VenueCard key={v.id} venue={v} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pros" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_PROS.map((p) => (
                <ProCard key={p.id} pro={p} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="caterers" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_CATERERS.map((p) => (
                <ProCard key={p.id} pro={p} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
    <p className="text-sm text-muted-foreground">{message}</p>
    <p className="mt-1 text-xs text-muted-foreground">
      We'll plug into Google Places next so the catalog goes live worldwide.
    </p>
  </div>
);

export default Discover;
