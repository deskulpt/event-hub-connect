import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Briefcase, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { deleteVendor, listOwnVendors } from "@/services/listings";
import { VendorFormDialog } from "@/components/marketplace/VendorFormDialog";
import { formatCents } from "@/lib/fitScore";

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
          icon={<Briefcase className="h-5 w-5 text-primary" />}
          title="No listings yet"
          description="Create your first service listing with category, city, and base price."
          action={<VendorFormDialog />}
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
                <p className="text-xs text-muted-foreground capitalize">{row.category} · {row.city ?? "—"}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between tabular-nums">
                  <span className="text-muted-foreground">From</span>
                  <span>{formatCents(row.base_price_cents)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2">
                  <VendorFormDialog initial={row} />
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
