import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { CalendarCheck, MapPin, Users, Wallet, Sparkles, Trash2, Pencil } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventBriefForm } from "@/components/events/EventBriefForm";
import { SendInquiryDialog } from "@/components/crm/SendInquiryDialog";
import { deleteEvent, getEvent, updateEvent } from "@/services/events";
import type { EventBriefInput, EventStatus } from "@/types/event";

const statusVariant: Record<EventStatus, "default" | "secondary" | "outline"> = {
  draft: "outline", planning: "secondary", booked: "default", completed: "secondary", cancelled: "outline",
};

const formatDate = (date: string | null) => {
  if (!date) return "Date TBD";
  try { return format(parseISO(date), "EEEE, MMMM d, yyyy"); } catch { return date; }
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (values: EventBriefInput) => updateEvent(id!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated");
      setEditing(false);
    },
    onError: (err: Error) => toast.error(err.message ?? "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted");
      navigate("/app/events");
    },
    onError: (err: Error) => toast.error(err.message ?? "Delete failed"),
  });

  if (isLoading) {
    return <PageLayout><Skeleton className="h-12 w-1/2" /><Skeleton className="h-64 w-full" /></PageLayout>;
  }

  if (error || !event) {
    return (
      <PageLayout>
        <EmptyState
          icon={<CalendarCheck className="h-5 w-5 text-primary" />}
          title="Event not found"
          description="Pick an event from All Events to see its full plan."
          action={<Button onClick={() => navigate("/app/events")}>Back to events</Button>}
        />
      </PageLayout>
    );
  }

  if (editing) {
    return (
      <PageLayout>
        <PageHeader title="Edit brief" subtitle={event.title} status="Editing" />
        <Card><CardContent className="p-6">
          <EventBriefForm
            initial={event}
            submitLabel="Save changes"
            submitting={updateMutation.isPending}
            onSubmit={async (v) => { await updateMutation.mutateAsync(v); }}
            onCancel={() => setEditing(false)}
          />
        </CardContent></Card>
      </PageLayout>
    );
  }

  const budget = event.budget_cents != null ? `$${(event.budget_cents / 100).toLocaleString()}` : "—";

  return (
    <PageLayout>
      <PageHeader
        title={event.title}
        subtitle={event.vibe ?? "Move this event from current stage to confirmed execution."}
        status={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        primaryCta={<Button size="sm"><Sparkles className="mr-1 h-4 w-4" /> Generate plan</Button>}
        secondaryCta={
          <>
            <SendInquiryDialog eventId={event.id} defaultSubject={event.title} triggerLabel="Send inquiry" />
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="mr-1 h-4 w-4" /> Edit brief
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: CalendarCheck, label: "Date", value: formatDate(event.event_date) },
          { icon: MapPin, label: "City", value: event.city ?? "—" },
          { icon: Users, label: "Guests", value: event.guest_count?.toString() ?? "—" },
          { icon: Wallet, label: "Budget", value: budget },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className="h-4 w-4 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="font-display text-base font-semibold tabular-nums">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Brief</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariant[event.status]} className="capitalize">{event.status}</Badge>
              {event.event_type && <Badge variant="outline" className="capitalize">{event.event_type}</Badge>}
            </div>
            {event.vibe && (
              <div><div className="text-xs font-medium text-muted-foreground">Vibe</div><p>{event.vibe}</p></div>
            )}
            {event.dietary_notes && (
              <div><div className="text-xs font-medium text-muted-foreground">Dietary</div><p>{event.dietary_notes}</p></div>
            )}
            {event.accessibility_notes && (
              <div><div className="text-xs font-medium text-muted-foreground">Accessibility</div><p>{event.accessibility_notes}</p></div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Next best actions</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Once Vibely AI processes your brief, matched venues, pros, and shortlists will land here.</p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/app/marketplace/discover")}>
              Browse marketplace
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{event.title}" and its brief. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
