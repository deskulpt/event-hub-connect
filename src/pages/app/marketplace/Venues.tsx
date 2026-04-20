import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { BentoCard } from "@/components/shell/Bento";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { deleteVenue, listOwnVenues } from "@/services/listings";
import { VenueFormDialog } from "@/components/marketplace/VenueFormDialog";
import { ListingCover } from "@/components/marketplace/ListingCover";
import { formatCents } from "@/lib/fitScore";

const initials = (s: string) => s.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

export default function Venues() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const venuesQ = useQuery({
    queryKey: ["own-venues", user?.id],
    queryFn: () => listOwnVenues(user!.id),
    enabled: !!user,
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => deleteVenue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["own-venues", user?.id] });
      toast.success("Venue deleted");
    },
  });

  const rows = venuesQ.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Marketplace"
        title="My venues"
        subtitle="Manage venues you own. Publish to make them discoverable."
        primaryCta={<VenueFormDialog />}
        secondaryCta={
          <Button asChild size="sm" variant="outline">
            <Link to="/app/marketplace">Browse marketplace</Link>
          </Button>
        }
      />

      {venuesQ.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading venues…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-5 w-5 text-primary-foreground" />}
          title="No venues yet"
          description="Add your first venue with capacity, vibe, and base price."
          action={<VenueFormDialog />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <BentoCard key={row.id} className="overflow-hidden p-0">
              <ListingCover seed={row.id} initials={initials(row.name)} photoUrl={row.photo_url} />
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-semibold">{row.name}</h3>
                    <p className="text-xs text-muted-foreground">{row.city ?? "—"}</p>
                  </div>
                  <Badge variant={row.published ? "default" : "secondary"} className="shrink-0">
                    {row.published ? "Published" : "Draft"}
                  </Badge>
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
                <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
                  <VenueFormDialog initial={row} />
                  <Button size="icon" variant="ghost" onClick={() => removeMut.mutate(row.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </BentoCard>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
