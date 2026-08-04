import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HandCoins } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { listSponsorshipPackages } from "@/services/adminConfig";
import { expressSponsorshipInterest } from "@/services/credentials";

const formatPrice = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(
    cents / 100,
  );

export const Sponsorships = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const packagesQuery = useQuery({
    queryKey: ["sponsorship-packages"],
    queryFn: listSponsorshipPackages,
  });

  const interest = useMutation({
    mutationFn: (packageId: string) =>
      expressSponsorshipInterest({ package_id: packageId, user_id: user!.id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Interest recorded — our team will follow up");
    },
    onError: () => toast.error("Could not record interest. Please try again."),
  });

  const packages = (packagesQuery.data ?? []).filter((p) => p.active);

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Sponsors"
        title="Sponsorship packages"
        subtitle="Reach a local 50+ audience through activities, circles and perks."
      />

      {packagesQuery.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {packagesQuery.isError && (
        <EmptyState
          title="Could not load packages"
          description="Something went wrong while fetching sponsorship options."
          action={
            <Button variant="outline" className="rounded-full" onClick={() => packagesQuery.refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {packagesQuery.isSuccess && packages.length === 0 && (
        <EmptyState
          icon={<HandCoins className="h-6 w-6 text-primary-foreground" />}
          title="No packages available"
          description="Sponsorship packages will appear here once published by the team."
        />
      )}

      {packages.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="rounded-2xl border-border/60 bg-card/70 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{pkg.name}</CardTitle>
                  <Badge variant="outline" className="shrink-0 rounded-full tab-num text-[10px]">
                    {formatPrice(pkg.price_cents, pkg.currency)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground tab-num">{pkg.duration_days} days</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {pkg.description ?? "Local sponsorship placement package."}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.placements.map((placement) => (
                    <Badge key={placement} variant="secondary" className="rounded-full text-[10px]">
                      {placement}
                    </Badge>
                  ))}
                </div>
                <Button
                  className="w-full rounded-full"
                  disabled={!user || interest.isPending}
                  onClick={() => interest.mutate(pkg.id)}
                >
                  Express interest
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};
