import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { listMyRedemptions, listPerks, redeemPerk } from "@/services/perks";

const CATEGORIES = ["all", "health", "food", "travel", "learning", "wellness", "services"];

export const Perks = () => {
  const { user } = useAuth();
  const { localityId, t } = usePreferences();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("all");

  const perksQuery = useQuery({
    queryKey: ["perks", localityId],
    queryFn: () => listPerks(localityId),
  });
  const redemptionsQuery = useQuery({
    queryKey: ["perk-redemptions", user?.id],
    queryFn: () => listMyRedemptions(user!.id),
    enabled: Boolean(user),
  });

  const redeem = useMutation({
    mutationFn: (perkId: string) => redeemPerk(perkId, user!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["perk-redemptions"] });
      void queryClient.invalidateQueries({ queryKey: ["perks"] });
      toast.success("Perk claimed — show the code at the counter");
    },
    onError: () => toast.error("Could not claim this perk. Please try again."),
  });

  const claimed = redemptionsQuery.data ?? [];
  const perks = (perksQuery.data ?? []).filter(
    (perk) => category === "all" || perk.category === category,
  );

  return (
    <PageLayout>
      <PageHeader eyebrow="Local offers" title={t("perks.title")} subtitle={t("perks.subtitle")} />

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setCategory(option)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
              category === option
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {perksQuery.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      )}

      {perksQuery.isError && (
        <EmptyState
          title="We could not load perks"
          description="Something went wrong while fetching local offers."
          action={
            <Button variant="outline" className="rounded-full" onClick={() => perksQuery.refetch()}>
              {t("common.retry")}
            </Button>
          }
        />
      )}

      {perksQuery.isSuccess && perks.length === 0 && (
        <EmptyState
          icon={<Gift className="h-6 w-6 text-primary-foreground" />}
          title="No perks in this category yet"
          description="Local businesses add offers every month — check back soon or try another category."
        />
      )}

      {perks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {perks.map((perk) => {
            const isClaimed = claimed.includes(perk.id);
            const soldOut =
              perk.max_redemptions !== null && perk.redemption_count >= perk.max_redemptions;
            return (
              <Card key={perk.id} className="rounded-2xl border-border/60 bg-card/70 backdrop-blur">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{perk.title}</CardTitle>
                    {perk.discount_label && (
                      <Badge className="shrink-0 rounded-full">{perk.discount_label}</Badge>
                    )}
                  </div>
                  {perk.ends_on && (
                    <p className="text-xs text-muted-foreground tab-num">Valid until {perk.ends_on}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-3 text-sm text-muted-foreground">{perk.description}</p>
                  {isClaimed && perk.code && (
                    <p className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-center font-mono text-sm text-primary">
                      {perk.code}
                    </p>
                  )}
                  <Button
                    className="w-full rounded-full"
                    variant={isClaimed ? "outline" : "default"}
                    disabled={!user || isClaimed || soldOut || redeem.isPending}
                    onClick={() => redeem.mutate(perk.id)}
                  >
                    {isClaimed ? t("perks.claimed") : soldOut ? "Fully claimed" : t("perks.claim")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};
