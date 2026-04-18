import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { deleteVenue, listOwnVenues } from "@/services/listings";
import { VenueFormDialog } from "@/components/marketplace/VenueFormDialog";
import { formatCents } from "@/lib/fitScore";

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
          icon={<Building2 className="h-5 w-5 text-primary" />}
          title="No venues yet"
          description="Add your first venue with capacity, vibe, and base price."
          action={<VenueFormDialog />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardHeader className="space-y-1.5 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{row.name}</CardTitle>
                  <Badge variant={row.published ? "default" : "secondary"}>
                    {row.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{row.city ?? "—"}</p>
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
                <div className="flex items-center justify-between gap-2 pt-2">
                  <VenueFormDialog initial={row} />
                  <Button size="icon" variant="ghost" onClick={() => removeMut.mutate(row.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
