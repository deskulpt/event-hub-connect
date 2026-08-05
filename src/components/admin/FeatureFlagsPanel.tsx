import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shell/EmptyState";
import { Flag } from "lucide-react";
import { listFeatureFlags, setFeatureFlag, listToggleOverrides } from "@/services/adminConfig";

export const FeatureFlagsPanel = () => {
  const queryClient = useQueryClient();
  const flagsQuery = useQuery({ queryKey: ["admin-flags"], queryFn: listFeatureFlags });
  const overridesQuery = useQuery({ queryKey: ["admin-overrides"], queryFn: listToggleOverrides });

  const toggle = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) => setFeatureFlag(key, enabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-flags"] });
      toast.success("Feature flag updated");
    },
    onError: () => toast.error("Could not update the flag. Please try again."),
  });

  if (flagsQuery.isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (flagsQuery.isError) {
    return <EmptyState icon={Flag} title="Could not load flags" description="Refresh the page to try again." />;
  }

  const flags = flagsQuery.data ?? [];
  const overrides = overridesQuery.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature flags</CardTitle>
          <CardDescription>Turn platform capabilities on or off for everyone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {flags.length === 0 && (
            <EmptyState icon={Flag} title="No flags yet" description="Flags appear here once they are seeded." />
          )}
          {flags.map((flag) => (
            <div key={flag.key} className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{flag.label ?? flag.key}</p>
                <p className="truncate text-xs text-muted-foreground">{flag.description ?? flag.key}</p>
              </div>
              <Switch
                checked={flag.enabled}
                disabled={toggle.isPending}
                onCheckedChange={(enabled) => toggle.mutate({ key: flag.key, enabled })}
                aria-label={`Toggle ${flag.label ?? flag.key}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scoped overrides</CardTitle>
          <CardDescription>Per-locality or per-organisation exceptions to the global flags.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {overrides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No overrides are in place.</p>
          ) : (
            overrides.map((override) => (
              <div key={override.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span className="font-mono text-xs">{override.flag_key}</span>
                <span className="text-xs text-muted-foreground">{override.scope_kind}</span>
                <Badge variant={override.enabled ? "default" : "outline"}>
                  {override.enabled ? "On" : "Off"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
