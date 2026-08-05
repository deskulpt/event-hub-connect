import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { CalendarCheck, MapPin, Users, Wallet, Sparkles, Trash2, Pencil, ClipboardCheck } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventBriefForm } from "@/components/events/EventBriefForm";
import { SendInquiryDialog } from "@/components/crm/SendInquiryDialog";
import { ShareInviteDialog } from "@/components/events/ShareInviteDialog";
import { EventPlanPanel } from "@/components/events/EventPlanPanel";
import {
  captureAttendance, deleteEvent, getEvent, submitEventFeedback, updateEvent, updateEventStatus,
} from "@/services/events";
import { generateEventPlan } from "@/services/plans";
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
  const [attended, setAttended] = useState("");
  const [noShows, setNoShows] = useState("");
  const [rating, setRating] = useState("5");
  const [feedbackNotes, setFeedbackNotes] = useState("");

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

  const invalidateEvent = () => {
    void queryClient.invalidateQueries({ queryKey: ["event", id] });
    void queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: EventStatus) => updateEventStatus(id!, status),
    onSuccess: () => {
      invalidateEvent();
      toast.success("Activity status updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Status update failed"),
  });

  const attendanceMutation = useMutation({
    mutationFn: () =>
      captureAttendance(id!, {
        attended_count: Number(attended) || 0,
        no_show_count: noShows === "" ? undefined : Number(noShows),
      }),
    onSuccess: () => {
      invalidateEvent();
      toast.success("Attendance captured — thanks for closing the loop");
    },
    onError: (err: Error) => toast.error(err.message ?? "Could not save attendance"),
  });

  const feedbackMutation = useMutation({
    mutationFn: () =>
      submitEventFeedback(id!, {
        feedback_rating: Number(rating) || 5,
        feedback_notes: feedbackNotes.trim() || undefined,
      }),
    onSuccess: () => {
      invalidateEvent();
      toast.success("Feedback saved for the proposal engine");
    },
    onError: (err: Error) => toast.error(err.message ?? "Could not save feedback"),
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
        primaryCta={
          <Button size="sm" onClick={() => { generateEventPlan(event.id).then(() => queryClient.invalidateQueries({ queryKey: ["event-plan", event.id] })).catch((e) => toast.error(e.message ?? "Plan generation failed")); }}>
            <Sparkles className="mr-1 h-4 w-4" /> Generate plan
          </Button>
        }
        secondaryCta={
          <>
            <ShareInviteDialog eventId={event.id} eventTitle={event.title} />
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
          <CardHeader><CardTitle className="text-base">Lifecycle</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Move this activity through planning → booked → completed so the proposal engine can learn.</p>
            <div className="flex flex-wrap gap-2">
              {(["planning", "booked", "completed"] as EventStatus[]).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={event.status === status ? "default" : "outline"}
                  className="rounded-full capitalize"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full rounded-full" onClick={() => navigate("/app/marketplace")}>
              Browse marketplace
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-primary" /> Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.attended_count != null ? (
              <p className="text-sm tab-num">
                Recorded {event.attended_count} attended
                {event.no_show_count != null ? ` · ${event.no_show_count} no-shows` : ""}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                After the activity, capture heads counted. This calibrates vote thresholds.
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                type="number"
                min="0"
                placeholder="Attended"
                aria-label="Attended count"
                value={attended}
                onChange={(e) => setAttended(e.target.value)}
                className="rounded-xl"
              />
              <Input
                type="number"
                min="0"
                placeholder="No-shows"
                aria-label="No-show count"
                value={noShows}
                onChange={(e) => setNoShows(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button
              className="rounded-full"
              disabled={attended === "" || attendanceMutation.isPending}
              onClick={() => attendanceMutation.mutate()}
            >
              {attendanceMutation.isPending ? "Saving…" : "Save attendance & complete"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Post-event feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.feedback_rating != null ? (
              <p className="text-sm tab-num">
                Rating {event.feedback_rating}/5
                {event.feedback_notes ? ` — ${event.feedback_notes}` : ""}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Rating and notes feed next month&apos;s proposal ranking.
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(String(value))}
                  className={`min-h-10 rounded-full border px-3 text-sm tab-num ${
                    rating === String(value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="What worked? What should change next time?"
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              aria-label="Feedback notes"
            />
            <Button
              className="rounded-full"
              disabled={feedbackMutation.isPending}
              onClick={() => feedbackMutation.mutate()}
            >
              {feedbackMutation.isPending ? "Saving…" : "Submit feedback"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <EventPlanPanel eventId={event.id} eventDate={event.event_date} />

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
