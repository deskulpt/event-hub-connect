import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shell/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { listReports, decideReport, triageReport } from "@/services/organizations";

export const ModerationPanel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const reportsQuery = useQuery({ queryKey: ["admin-reports"], queryFn: listReports });

  const decide = useMutation({
    mutationFn: ({ id, status, decision }: { id: string; status: "actioned" | "dismissed"; decision: string }) =>
      decideReport(id, status, decision, user!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Report resolved");
    },
    onError: () => toast.error("Could not resolve the report. Please try again."),
  });

  const triage = useMutation({
    mutationFn: (id: string) => triageReport(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("AI triage complete");
    },
    onError: () => toast.error("Triage failed. Please try again."),
    onSettled: () => setBusyId(null),
  });

  if (reportsQuery.isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (reportsQuery.isError) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-6 w-6 text-primary-foreground" />}
        title="Could not load reports"
        description="Refresh the page to try again."
      />
    );
  }

  const reports = reportsQuery.data ?? [];

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-6 w-6 text-primary-foreground" />}
        title="Nothing to review"
        description="Member reports will appear here as they come in."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Report queue</CardTitle>
        <CardDescription>Triage member reports and record a decision.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="space-y-2 rounded-xl border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">{report.status}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{report.subject_table}</span>
              {report.triage_label && (
                <Badge className="capitalize">
                  {report.triage_label}
                  {report.triage_confidence !== null ? ` ${(report.triage_confidence * 100).toFixed(0)}%` : ""}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium">{report.reason}</p>
            {report.details && <p className="text-xs text-muted-foreground">{report.details}</p>}
            {report.status === "open" || report.status === "triaged" ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={triage.isPending && busyId === report.id}
                  onClick={() => {
                    setBusyId(report.id);
                    triage.mutate(report.id);
                  }}
                >
                  Run AI triage
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={decide.isPending}
                  onClick={() => decide.mutate({ id: report.id, status: "actioned", decision: "Content removed" })}
                >
                  Action report
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  disabled={decide.isPending}
                  onClick={() => decide.mutate({ id: report.id, status: "dismissed", decision: "No violation found" })}
                >
                  Dismiss report
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Decision: {report.decision ?? "recorded"}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
