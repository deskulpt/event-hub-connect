import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Plus, MapPin, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listEvents } from "@/services/events";
import type { EventStatus } from "@/types/event";

const statusVariant: Record<EventStatus, "default" | "secondary" | "outline"> = {
  draft: "outline",
  planning: "secondary",
  booked: "default",
  completed: "secondary",
  cancelled: "outline",
};

const formatBudget = (cents: number | null) =>
  cents == null ? "—" : `$${(cents / 100).toLocaleString()}`;

const formatDate = (date: string | null) => {
  if (!date) return "Date TBD";
  try { return format(parseISO(date), "MMM d, yyyy"); } catch { return date; }
};

export default function AllEvents() {
  const navigate = useNavigate();
  const { data: events, isLoading, error } = useQuery({ queryKey: ["events"], queryFn: listEvents });

  return (
    <PageLayout>
      <PageHeader
        title="All events"
        subtitle="Find, prioritize, and manage every event across your workspace."
        primaryCta={
          <Button size="sm" onClick={() => navigate("/app/events/new")}>
            <Plus className="mr-1 h-4 w-4" /> New event
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      )}

      {error && (
        <Card><CardContent className="p-6 text-sm text-destructive">Failed to load events. Please refresh.</CardContent></Card>
      )}

      {!isLoading && !error && events?.length === 0 && (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5 text-primary" />}
          title="No events yet"
          description="Create your first event to start planning, shortlisting, and booking."
          action={<Button onClick={() => navigate("/app/events/new")}><Plus className="mr-1 h-4 w-4" /> Create event</Button>}
        />
      )}

      {events && events.length > 0 && (
        <div className="grid gap-3">
          {events.map((e) => (
            <Card
              key={e.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => navigate(`/app/events/${e.id}`)}
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{e.title}</h3>
                    <Badge variant={statusVariant[e.status]} className="capitalize">{e.status}</Badge>
                    {e.event_type && <Badge variant="outline" className="capitalize">{e.event_type}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(e.event_date)}</span>
                    {e.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.city}</span>}
                    {e.guest_count != null && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{e.guest_count} guests</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-semibold tabular-nums">{formatBudget(e.budget_cents)}</div>
                  <div className="text-xs text-muted-foreground">Budget</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
