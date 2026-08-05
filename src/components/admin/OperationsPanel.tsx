import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listGenerationRuns, listGenerationRules, listAuditLog } from "@/services/adminConfig";

interface AuditRow {
  id: string;
  domain: string;
  action: string;
  target_id: string | null;
  reason: string | null;
  created_at: string;
}

const timeAgo = (value: string) => {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

export const OperationsPanel = () => {
  const runsQuery = useQuery({ queryKey: ["admin-runs"], queryFn: listGenerationRuns });
  const rulesQuery = useQuery({ queryKey: ["admin-genrules"], queryFn: listGenerationRules });
  const auditQuery = useQuery({ queryKey: ["admin-audit"], queryFn: listAuditLog });

  const audit = (auditQuery.data ?? []) as AuditRow[];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proposal generation rules</CardTitle>
          <CardDescription>How monthly activity slates are produced per locality.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {rulesQuery.isLoading && <Skeleton className="h-24 w-full rounded-xl" />}
          {rulesQuery.isError && (
            <p className="text-sm text-muted-foreground">Could not load rules. Refresh to try again.</p>
          )}
          {!rulesQuery.isLoading && (rulesQuery.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No generation rules configured; defaults apply.</p>
          )}
          {(rulesQuery.data ?? []).map((rule) => (
            <div key={rule.id} className="rounded-xl border p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{rule.locality_id ? "Locality rule" : "Global default"}</span>
                <Badge variant={rule.enabled ? "default" : "outline"}>{rule.enabled ? "Enabled" : "Paused"}</Badge>
              </div>
              <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                Slate {rule.slate_size} · min threshold {rule.min_threshold} · multiplier {rule.threshold_multiplier} ·
                voting {rule.voting_window_days} days · bands {rule.radius_bands.join(", ")} mi
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generation runs</CardTitle>
          <CardDescription>Recent AI proposal runs and their diagnostics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {runsQuery.isLoading && <Skeleton className="h-24 w-full rounded-xl" />}
          {runsQuery.isError && (
            <p className="text-sm text-muted-foreground">Could not load runs. Refresh to try again.</p>
          )}
          {!runsQuery.isLoading && (runsQuery.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No proposal runs yet.</p>
          )}
          {(runsQuery.data ?? []).map((run) => (
            <div key={run.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm">
              <div>
                <p className="font-medium">{run.period}</p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {run.proposals_created} proposals · {run.model ?? "model n/a"} · {timeAgo(run.created_at)}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">{run.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit log</CardTitle>
          <CardDescription>The last 100 staff actions across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {auditQuery.isLoading && <Skeleton className="h-24 w-full rounded-xl" />}
          {auditQuery.isError && (
            <p className="text-sm text-muted-foreground">Could not load the audit log. Refresh to try again.</p>
          )}
          {!auditQuery.isLoading && audit.length === 0 && (
            <p className="text-sm text-muted-foreground">No staff actions recorded yet.</p>
          )}
          {audit.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {entry.domain} · {entry.action}
                </p>
                {entry.reason && <p className="truncate text-xs text-muted-foreground">{entry.reason}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{timeAgo(entry.created_at)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
