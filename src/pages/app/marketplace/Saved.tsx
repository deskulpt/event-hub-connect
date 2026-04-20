import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bookmark, GitCompare, MapPin, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { BentoCard } from "@/components/shell/Bento";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listEvents } from "@/services/events";
import {
  getVendorsByIds,
  getVenuesByIds,
  listSaved,
  unsaveListing,
} from "@/services/listings";
import { formatCents, scoreVendorFit, scoreVenueFit } from "@/lib/fitScore";
import { FitRing } from "@/components/marketplace/FitRing";
import { ListingCover } from "@/components/marketplace/ListingCover";

const initials = (s: string) => s.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

export default function Saved() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const eventsQ = useQuery({ queryKey: ["events", user?.id], queryFn: listEvents, enabled: !!user });
  const activeEvent = useMemo(() => {
    const list = eventsQ.data ?? [];
    return list.find((e) => e.status === "planning") ?? list.find((e) => e.status === "draft") ?? list[0] ?? null;
  }, [eventsQ.data]);

  const savedQ = useQuery({
    queryKey: ["saved", user?.id],
    queryFn: () => listSaved(user!.id),
    enabled: !!user,
  });

  const venueIds = useMemo(() => (savedQ.data ?? []).filter((s) => s.listing_kind === "venue").map((s) => s.listing_id), [savedQ.data]);
  const proIds = useMemo(() => (savedQ.data ?? []).filter((s) => s.listing_kind === "pro").map((s) => s.listing_id), [savedQ.data]);

  const venuesQ = useQuery({ queryKey: ["saved-venues", venueIds], queryFn: () => getVenuesByIds(venueIds), enabled: venueIds.length > 0 });
  const vendorsQ = useQuery({ queryKey: ["saved-vendors", proIds], queryFn: () => getVendorsByIds(proIds), enabled: proIds.length > 0 });

  const removeMut = useMutation({
    mutationFn: ({ id, kind }: { id: string; kind: "venue" | "pro" }) => unsaveListing(user!.id, id, kind),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved", user?.id] });
      toast.success("Removed");
    },
  });

  const totalSaved = (savedQ.data ?? []).length;

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Marketplace"
        title="Shortlist"
        subtitle="Everything you've saved across the marketplace, ranked by Fit Score against your active event."
        primaryCta={
          totalSaved >= 2 ? (
            <Button asChild size="sm">
              <Link to="/app/marketplace/compare"><GitCompare className="mr-1 h-4 w-4" /> Compare</Link>
            </Button>
          ) : undefined
        }
      />

      {savedQ.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading shortlist…</p>
      ) : totalSaved === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-5 w-5 text-primary-foreground" />}
          title="Nothing saved yet"
          description="Tap Save on any listing to add it here for comparison."
          action={<Button asChild size="sm"><Link to="/app/marketplace">Browse marketplace</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(venuesQ.data ?? []).map((row) => {
            const fit = scoreVenueFit(activeEvent, row);
            return (
              <BentoCard key={`v-${row.id}`} glow className="overflow-hidden p-0">
                <ListingCover seed={row.id} initials={initials(row.name)} photoUrl={row.photo_url} />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-semibold">{row.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className="rounded-full text-[9px] uppercase">Venue</Badge>
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
                  <div className="flex items-center justify-between border-t border-border/50 pt-2">
                    <Button asChild size="sm" variant="outline"><Link to={`/app/marketplace/venue/${row.id}`}>View</Link></Button>
                    <Button size="icon" variant="ghost" onClick={() => removeMut.mutate({ id: row.id, kind: "venue" })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </BentoCard>
            );
          })}
          {(vendorsQ.data ?? []).map((row) => {
            const fit = scoreVendorFit(activeEvent, row);
            return (
              <BentoCard key={`p-${row.id}`} glow className="overflow-hidden p-0">
                <ListingCover seed={row.id} initials={initials(row.name)} photoUrl={row.photo_url} />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-semibold">{row.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                        <Badge variant="outline" className="rounded-full text-[9px] uppercase">{row.category}</Badge>
                        <MapPin className="h-3 w-3" /> {row.city ?? "—"}
                      </p>
                    </div>
                    <FitRing score={fit.total} size={48} />
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-2 text-xs">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
                    <div className="font-medium tabular-nums">{formatCents(row.base_price_cents)}</div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-2">
                    <Button asChild size="sm" variant="outline"><Link to={`/app/marketplace/pro/${row.id}`}>View</Link></Button>
                    <Button size="icon" variant="ghost" onClick={() => removeMut.mutate({ id: row.id, kind: "pro" })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </BentoCard>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
