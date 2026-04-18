import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { GitBranch } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { listInquiriesSent } from "@/services/inquiries";
import { listBookingsAsHost } from "@/services/bookings";
import type { InquiryRecord } from "@/types/inquiry";
import type { BookingRecord } from "@/types/booking";

type Stage = "new" | "contacted" | "quoted" | "booked" | "lost";

interface PipelineCard {
  id: string;
  title: string;
  meta: string;
  stage: Stage;
  kind: "inquiry" | "booking";
  onClick?: () => void;
}

const STAGES: { id: Stage; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "booked", label: "Booked" },
  { id: "lost", label: "Lost" },
];

const inquiryStage = (i: InquiryRecord): Stage => {
  if (i.status === "new") return "new";
  if (i.status === "sent") return "contacted";
  if (i.status === "replied") return "quoted";
  if (i.status === "declined" || i.status === "expired") return "lost";
  return "contacted";
};

const bookingStage = (b: BookingRecord): Stage => {
  if (b.status === "cancelled" || b.status === "refunded") return "lost";
  return "booked";
};

export default function Pipeline() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const inq = useQuery({
    queryKey: ["inquiries", "sent", user?.id],
    queryFn: () => listInquiriesSent(user!.id),
    enabled: !!user,
  });
  const bk = useQuery({
    queryKey: ["bookings", "host", user?.id],
    queryFn: () => listBookingsAsHost(user!.id),
    enabled: !!user,
  });

  const cards: PipelineCard[] = useMemo(() => {
    const fromInq = (inq.data ?? []).map<PipelineCard>((i) => ({
      id: `i-${i.id}`,
      title: i.subject,
      meta: i.requested_date ? format(parseISO(i.requested_date), "MMM d") : "No date",
      stage: inquiryStage(i),
      kind: "inquiry",
      onClick: () => navigate(`/app/crm/conversations?inquiry=${i.id}`),
    }));
    const fromBk = (bk.data ?? []).map<PipelineCard>((b) => ({
      id: `b-${b.id}`,
      title: b.title,
      meta: b.event_date ? format(parseISO(b.event_date), "MMM d") : "No date",
      stage: bookingStage(b),
      kind: "booking",
    }));
    return [...fromInq, ...fromBk];
  }, [inq.data, bk.data, navigate]);

  const isLoading = inq.isLoading || bk.isLoading;
  const isEmpty = !isLoading && cards.length === 0;

  return (
    <PageLayout>
      <PageHeader
        title="Pipeline"
        subtitle="See every inquiry and booking from first contact to confirmed."
        status="CRM"
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isEmpty ? (
        <EmptyState
          icon={<GitBranch className="h-5 w-5 text-primary" />}
          title="No deals in pipeline"
          description="Send an inquiry from an event or create a booking to populate the pipeline."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {STAGES.map((s) => {
            const items = cards.filter((c) => c.stage === s.id);
            return (
              <Card key={s.id} className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                    {s.label}
                    <Badge variant="outline" className="tabular-nums">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">—</p>
                  ) : (
                    items.map((c) => (
                      <button
                        key={c.id}
                        onClick={c.onClick}
                        className="w-full rounded-md border border-border/60 bg-background p-2 text-left transition-colors hover:bg-muted"
                      >
                        <div className="text-xs font-medium line-clamp-2">{c.title}</div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="capitalize">{c.kind}</span>
                          <span>{c.meta}</span>
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
