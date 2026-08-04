import { useQuery } from "@tanstack/react-query";
import { PhoneCall } from "lucide-react";
import { format, parseISO } from "date-fns";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { listVoiceCalls } from "@/services/voiceCalls";

export default function Calls() {
  const { user } = useAuth();
  const callsQ = useQuery({
    queryKey: ["voice-calls", user?.id],
    queryFn: () => listVoiceCalls(user!.id),
    enabled: Boolean(user),
  });

  const calls = callsQ.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        title="AI Calls"
        subtitle="Confirm availability and reservation details — outcomes land here."
      />

      {callsQ.isLoading && <Skeleton className="h-32 w-full rounded-2xl" />}

      {callsQ.isSuccess && calls.length === 0 && (
        <EmptyState
          icon={<PhoneCall className="h-5 w-5 text-primary" />}
          title="Call queue is empty"
          description="When AI confirmation calls finish, their outcomes and summaries appear here."
        />
      )}

      {calls.length > 0 && (
        <div className="space-y-2">
          {calls.map((call) => (
            <Card key={call.id} className="rounded-2xl border-border/60">
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{call.target_name ?? "Unknown contact"}</span>
                  <Badge variant="outline" className="rounded-full capitalize text-[10px]">
                    {call.status}
                  </Badge>
                  {call.outcome && (
                    <Badge className="rounded-full capitalize text-[10px]">{call.outcome}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground tab-num">
                  {call.phone && <span>{call.phone}</span>}
                  <span>{format(parseISO(call.created_at), "MMM d, yyyy HH:mm")}</span>
                </div>
                {call.summary && <p className="text-sm text-muted-foreground">{call.summary}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
