import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Briefcase, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { BentoCard } from "@/components/shell/Bento";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { deleteVendor, listOwnVendors } from "@/services/listings";
import { VendorFormDialog } from "@/components/marketplace/VendorFormDialog";
import { ListingCover } from "@/components/marketplace/ListingCover";
import { formatCents } from "@/lib/fitScore";

const initials = (s: string) => s.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

export default function Pros() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["own-vendors", user?.id],
    queryFn: () => listOwnVendors(user!.id),
    enabled: !!user,
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["own-vendors", user?.id] });
      toast.success("Listing deleted");
    },
  });

  const rows = q.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Marketplace"
        title="My services"
        subtitle="Manage your service listings — chef, DJ, photographer, planner, and more."
        primaryCta={<VendorFormDialog />}
        secondaryCta={
          <Button asChild size="sm" variant="outline">
            <Link to="/app/marketplace">Browse marketplace</Link>
          </Button>
        }
      />

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading listings…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-5 w-5 text-primary-foreground" />}
          title="No listings yet"
          description="Create your first service listing with category, city, and base price."
          action={<VendorFormDialog />}
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
                    <p className="text-xs text-muted-foreground capitalize">{row.category} · {row.city ?? "—"}</p>
                  </div>
                  <Badge variant={row.published ? "default" : "secondary"} className="shrink-0">
                    {row.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-2 text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
                  <div className="font-medium tabular-nums">{formatCents(row.base_price_cents)}</div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
                  <VendorFormDialog initial={row} />
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
