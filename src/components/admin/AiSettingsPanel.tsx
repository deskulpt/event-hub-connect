import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listAiSettings, updateAiSetting } from "@/services/adminConfig";

export const AiSettingsPanel = () => {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: ["admin-ai"], queryFn: listAiSettings });

  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => updateAiSetting(id, { enabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ai"] });
      toast.success("AI setting updated");
    },
    onError: () => toast.error("Could not update the setting. Please try again."),
  });

  if (settingsQuery.isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (settingsQuery.isError) {
    return <p className="text-sm text-muted-foreground">Could not load AI settings. Refresh to try again.</p>;
  }

  const settings = settingsQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI providers</CardTitle>
        <CardDescription>Primary and fallback models used by each AI skill.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {settings.length === 0 && <p className="text-sm text-muted-foreground">No AI features are configured yet.</p>}
        {settings.map((setting) => (
          <div key={setting.id} className="rounded-xl border p-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium capitalize">{setting.feature.replace(/[-_]/g, " ")}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {setting.primary_provider} / {setting.primary_model}
                </p>
                {setting.fallback_model && (
                  <p className="font-mono text-xs text-muted-foreground">
                    fallback: {setting.fallback_provider} / {setting.fallback_model}
                  </p>
                )}
              </div>
              <Switch
                checked={setting.enabled}
                disabled={toggle.isPending}
                onCheckedChange={(enabled) => toggle.mutate({ id: setting.id, enabled })}
                aria-label={`Toggle ${setting.feature}`}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {setting.rate_limit_per_min !== null && (
                <Badge variant="outline" className="tabular-nums">{setting.rate_limit_per_min}/min</Badge>
              )}
              {setting.monthly_spend_cap_cents !== null && (
                <Badge variant="outline" className="tabular-nums">
                  Cap ${(setting.monthly_spend_cap_cents / 100).toFixed(0)}/mo
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
