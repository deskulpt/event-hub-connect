import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreferences } from "@/contexts/PreferencesContext";
import { LanguageMenu, AccessibilityMenu } from "@/components/shell/PreferencesMenu";
import { listLocalities } from "@/services/localities";
import { INTEREST_OPTIONS } from "@/types/community";
import { coverageFor } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    language,
    accessibility,
    localityId,
    interests,
    setLocalityId,
    setInterests,
    t,
  } = usePreferences();
  const queryClient = useQueryClient();

  const localitiesQ = useQuery({ queryKey: ["localities"], queryFn: listLocalities });

  const saveInterests = useMutation({
    mutationFn: (values: string[]) => setInterests(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Interests saved");
    },
    onError: () => toast.error("Could not save interests"),
  });

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle="Language, accessibility, locality and interests for your community experience."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SettingsIcon className="h-4 w-4 text-primary" /> Language & accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <LanguageMenu />
              <AccessibilityMenu />
            </div>
            <p className="text-sm text-muted-foreground">
              Current language: <span className="font-medium text-foreground">{language.toUpperCase()}</span>
              {" · "}
              coverage {coverageFor(language)}%
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              Text {accessibility.textScale ?? "normal"}
              {accessibility.contrast === "high" ? " · high contrast" : ""}
              {accessibility.reduceMotion ? " · reduced motion" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Locality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {localitiesQ.isLoading && <Skeleton className="h-20 w-full" />}
            <div className="flex flex-wrap gap-1.5">
              {(localitiesQ.data ?? []).map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => void setLocalityId(loc.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    localityId === loc.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {loc.name}
                </button>
              ))}
            </div>
            {(localitiesQ.data ?? []).length === 0 && !localitiesQ.isLoading && (
              <p className="text-sm text-muted-foreground">No localities seeded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? interests.filter((i) => i !== interest)
                        : [...interests, interest];
                      void saveInterests.mutate(next);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={saveInterests.isPending}
              onClick={() => saveInterests.mutate(interests)}
            >
              {t("common.save")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
