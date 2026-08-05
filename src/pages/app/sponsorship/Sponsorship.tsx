import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listSponsorshipPackages } from "@/services/adminConfig";

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

export const Sponsorship = () => {
  const packagesQuery = useQuery({ queryKey: ["sponsorship-packages"], queryFn: listSponsorshipPackages });
  const packages = (packagesQuery.data ?? []).filter((pkg) => pkg.active);

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Sponsors"
        title="Sponsorship packages"
        subtitle="Support local activities and reach members in your neighbourhood."
      />

      {packagesQuery.isLoading && <Skeleton className="h-56 w-full rounded-2xl" />}

      {packagesQuery.isError && (
        <EmptyState
          icon={<Megaphone className="h-6 w-6 text-primary-foreground" />}
          title="Could not load packages"
          description="Refresh the page to try again."
        />
      )}

      {!packagesQuery.isLoading && !packagesQuery.isError && packages.length === 0 && (
        <EmptyState
          icon={<Megaphone className="h-6 w-6 text-primary-foreground" />}
          title="No packages available"
          description="New sponsorship options will appear here soon."
        />
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{pkg.name}</CardTitle>
              <p className="text-lg font-semibold tabular-nums">{money(pkg.price_cents, pkg.currency)}</p>
              <p className="text-xs tabular-nums text-muted-foreground">{pkg.duration_days} days</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              {pkg.description && <p className="text-xs text-muted-foreground">{pkg.description}</p>}
              <div className="flex flex-wrap gap-1">
                {pkg.placements.map((placement) => (
                  <Badge key={placement} variant="outline" className="text-[10px]">{placement}</Badge>
                ))}
              </div>
              <Button
                className="mt-auto rounded-full"
                onClick={() => toast.success("Thanks — our partnerships team will reach out shortly.")}
              >
                Express interest
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
};
