import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GitCompare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { BentoCard } from "@/components/shell/Bento";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listEvents } from "@/services/events";
import { getVendorsByIds, getVenuesByIds, listSaved } from "@/services/listings";
import { formatCents, scoreVendorFit, scoreVenueFit, type FitBreakdown } from "@/lib/fitScore";
import { FitRing } from "@/components/marketplace/FitRing";

interface CompareRow {
  kind: "venue" | "pro";
  id: string;
  name: string;
  city: string | null;
  capacity: string;
  price: number | null;
  tags: string[];
  fit: FitBreakdown;
}

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

  const rows: CompareRow[] = useMemo(() => {
    const venueRows = (venuesQ.data ?? []).map<CompareRow>((v) => ({
      kind: "venue",
      id: v.id,
      name: v.name,
      city: v.city,
      capacity: `${v.capacity_min ?? 0}–${v.capacity_max ?? 0}`,
      price: v.base_price_cents,
      tags: v.vibe_tags ?? [],
      fit: scoreVenueFit(activeEvent, v),
    }));
    const vendorRows = (vendorsQ.data ?? []).map<CompareRow>((v) => ({
      kind: "pro",
      id: v.id,
      name: v.name,
      city: v.city,
      capacity: v.category,
      price: v.base_price_cents,
      tags: v.vibe_tags ?? [],
      fit: scoreVendorFit(activeEvent, v),
    }));
    return [...venueRows, ...vendorRows].sort((a, b) => b.fit.total - a.fit.total);
  }, [venuesQ.data, vendorsQ.data, activeEvent]);

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Marketplace"
        title="Compare shortlist"
        subtitle={
          activeEvent
            ? `Side-by-side comparison ranked against "${activeEvent.title}".`
            : "Save listings, then create or activate an event to score them."
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<GitCompare className="h-5 w-5 text-primary-foreground" />}
          title="Save listings to compare"
          description="Add at least 2 listings from the marketplace to see them here."
          action={<Button asChild size="sm"><Link to="/app/marketplace">Browse marketplace</Link></Button>}
        />
      ) : (
        <BentoCard className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-3 py-3 text-left">Type</th>
                <th className="px-3 py-3 text-left">City</th>
                <th className="px-3 py-3 text-left">Capacity / Cat.</th>
                <th className="px-3 py-3 text-right">From</th>
                <th className="px-3 py-3 text-left">Vibe</th>
                <th className="px-3 py-3 text-center">Fit</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.kind}-${r.id}`} className="border-b border-border/30 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-3 py-3 text-xs capitalize text-muted-foreground">{r.kind}</td>
                  <td className="px-3 py-3 text-xs">{r.city ?? "—"}</td>
                  <td className="px-3 py-3 text-xs capitalize">{r.capacity}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCents(r.price)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] capitalize">{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="inline-flex items-center justify-center">
                      <FitRing score={r.fit.total} size={40} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/app/marketplace/${r.kind}/${r.id}`} className="text-xs"><Sparkles className="mr-1 h-3 w-3" />View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </BentoCard>
      )}
    </PageLayout>
  );
}
