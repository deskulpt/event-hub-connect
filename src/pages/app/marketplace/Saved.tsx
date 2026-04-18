import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bookmark, GitCompare, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
          icon={<Bookmark className="h-5 w-5 text-primary" />}
          title="Nothing saved yet"
          description="Tap Save on any listing to add it here for comparison."
          action={<Button asChild size="sm"><Link to="/app/marketplace">Browse marketplace</Link></Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(venuesQ.data ?? []).map((row) => {
            const fit = scoreVenueFit(activeEvent, row);
            return (
              <Card key={`v-${row.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{row.name}</CardTitle>
                    <Badge variant="secondary">Fit {fit.total}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Venue · {row.city ?? "—"}</p>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between tabular-nums"><span className="text-muted-foreground">Capacity</span><span>{row.capacity_min ?? 0}–{row.capacity_max ?? 0}</span></div>
                  <div className="flex justify-between tabular-nums"><span className="text-muted-foreground">From</span><span>{formatCents(row.base_price_cents)}</span></div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button asChild size="sm" variant="outline"><Link to={`/app/marketplace/venue/${row.id}`}>View</Link></Button>
                  <Button size="icon" variant="ghost" onClick={() => removeMut.mutate({ id: row.id, kind: "venue" })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {(vendorsQ.data ?? []).map((row) => {
            const fit = scoreVendorFit(activeEvent, row);
            return (
              <Card key={`p-${row.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{row.name}</CardTitle>
                    <Badge variant="secondary">Fit {fit.total}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{row.category} · {row.city ?? "—"}</p>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between tabular-nums"><span className="text-muted-foreground">From</span><span>{formatCents(row.base_price_cents)}</span></div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button asChild size="sm" variant="outline"><Link to={`/app/marketplace/pro/${row.id}`}>View</Link></Button>
                  <Button size="icon" variant="ghost" onClick={() => removeMut.mutate({ id: row.id, kind: "pro" })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
