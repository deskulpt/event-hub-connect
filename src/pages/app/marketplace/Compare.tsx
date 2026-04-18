import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GitCompare } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listEvents } from "@/services/events";
import { getVendorsByIds, getVenuesByIds, listSaved } from "@/services/listings";
import { formatCents, scoreVendorFit, scoreVenueFit } from "@/lib/fitScore";

export default function Compare() {
  const { user } = useAuth();
  const eventsQ = useQuery({ queryKey: ["events", user?.id], queryFn: listEvents, enabled: !!user });
  const activeEvent = useMemo(() => {
    const list = eventsQ.data ?? [];
    return list.find((e) => e.status === "planning") ?? list.find((e) => e.status === "draft") ?? list[0] ?? null;
  }, [eventsQ.data]);

  const savedQ = useQuery({ queryKey: ["saved", user?.id], queryFn: () => listSaved(user!.id), enabled: !!user });
  const venueIds = useMemo(() => (savedQ.data ?? []).filter((s) => s.listing_kind === "venue").map((s) => s.listing_id), [savedQ.data]);
  const proIds = useMemo(() => (savedQ.data ?? []).filter((s) => s.listing_kind === "pro").map((s) => s.listing_id), [savedQ.data]);
  const venuesQ = useQuery({ queryKey: ["saved-venues", venueIds], queryFn: () => getVenuesByIds(venueIds), enabled: venueIds.length > 0 });
  const vendorsQ = useQuery({ queryKey: ["saved-vendors", proIds], queryFn: () => getVendorsByIds(proIds), enabled: proIds.length > 0 });

  const venueRows = (venuesQ.data ?? []).map((v) => ({
    kind: "venue" as const,
    id: v.id,
    name: v.name,
    city: v.city,
    capacity: `${v.capacity_min ?? 0}–${v.capacity_max ?? 0}`,
    price: v.base_price_cents,
    tags: v.vibe_tags ?? [],
    fit: scoreVenueFit(activeEvent, v).total,
  }));
  const vendorRows = (vendorsQ.data ?? []).map((v) => ({
    kind: "pro" as const,
    id: v.id,
    name: v.name,
    city: v.city,
    capacity: v.category,
    price: v.base_price_cents,
    tags: v.vibe_tags ?? [],
    fit: scoreVendorFit(activeEvent, v).total,
  }));
  const rows = [...venueRows, ...vendorRows].sort((a, b) => b.fit - a.fit);

  return (
    <PageLayout>
      <PageHeader
        title="Compare shortlist"
        subtitle="Side-by-side comparison of your saved venues and pros, ranked by Fit Score."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<GitCompare className="h-5 w-5 text-primary" />}
          title="Save listings to compare"
          description="Add at least 2 listings from the marketplace to see them here."
          action={<Button asChild size="sm"><Link to="/app/marketplace">Browse marketplace</Link></Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Capacity / Category</TableHead>
                <TableHead className="text-right">From</TableHead>
                <TableHead>Vibe</TableHead>
                <TableHead className="text-right">Fit</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={`${r.kind}-${r.id}`}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="capitalize text-xs text-muted-foreground">{r.kind}</TableCell>
                  <TableCell>{r.city ?? "—"}</TableCell>
                  <TableCell className="capitalize">{r.capacity}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCents(r.price)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Badge variant="secondary">{r.fit}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/app/marketplace/${r.kind}/${r.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageLayout>
  );
}
