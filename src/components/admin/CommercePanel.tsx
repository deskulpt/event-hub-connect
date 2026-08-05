import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listCommissionRules,
  listSponsorshipPackages,
  setSponsorshipPackageActive,
} from "@/services/adminConfig";

const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

export const CommercePanel = () => {
  const queryClient = useQueryClient();
  const rulesQuery = useQuery({ queryKey: ["admin-commissions"], queryFn: listCommissionRules });
  const packagesQuery = useQuery({ queryKey: ["admin-packages"], queryFn: listSponsorshipPackages });

  const togglePackage = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setSponsorshipPackageActive(id, active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      toast.success("Package updated");
    },
    onError: () => toast.error("Could not update the package. Please try again."),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Commission rules</CardTitle>
          <CardDescription>Platform take rate by supplier category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {rulesQuery.isLoading && <Skeleton className="h-32 w-full rounded-xl" />}
          {rulesQuery.isError && (
            <p className="text-sm text-muted-foreground">Could not load commission rules. Refresh to try again.</p>
          )}
          {!rulesQuery.isLoading && (rulesQuery.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No commission rules are configured.</p>
          )}
          {(rulesQuery.data ?? []).map((rule) => (
            <div key={rule.id} className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
              <span className="capitalize">{rule.category}</span>
              <span className="tabular-nums text-muted-foreground">
                {rule.rate_percent}% · floor {money(rule.floor_cents)}
                {rule.cap_cents !== null ? ` · cap ${money(rule.cap_cents)}` : ""}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sponsorship packages</CardTitle>
          <CardDescription>Paid placements sponsors can buy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {packagesQuery.isLoading && <Skeleton className="h-32 w-full rounded-xl" />}
          {packagesQuery.isError && (
            <p className="text-sm text-muted-foreground">Could not load packages. Refresh to try again.</p>
          )}
          {!packagesQuery.isLoading && (packagesQuery.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No sponsorship packages yet.</p>
          )}
          {(packagesQuery.data ?? []).map((pkg) => (
            <div key={pkg.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{pkg.name}</p>
                <p className="truncate text-xs tabular-nums text-muted-foreground">
                  {money(pkg.price_cents, pkg.currency)} · {pkg.duration_days} days
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {pkg.placements.map((placement) => (
                    <Badge key={placement} variant="outline" className="text-[10px]">{placement}</Badge>
                  ))}
                </div>
              </div>
              <Switch
                checked={pkg.active}
                disabled={togglePackage.isPending}
                onCheckedChange={(active) => togglePackage.mutate({ id: pkg.id, active })}
                aria-label={`Toggle ${pkg.name}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
