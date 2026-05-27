import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Loader2, Clock, ListChecks, Users } from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BentoCard, GradientOrb } from "@/components/shell/Bento";
import { generateEventPlan, getEventPlan, type PlanTask } from "@/services/plans";

interface Props { eventId: string; eventDate: string | null }

const priorityVariant: Record<PlanTask["priority"], "default" | "secondary" | "outline"> = {
  high: "default", medium: "secondary", low: "outline",
};

export const EventPlanPanel = ({ eventId, eventDate }: Props) => {
  const qc = useQueryClient();
  const planQ = useQuery({ queryKey: ["event-plan", eventId], queryFn: () => getEventPlan(eventId) });
  const genMut = useMutation({
    mutationFn: () => generateEventPlan(eventId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["event-plan", eventId] }); toast.success("Plan ready"); },
    onError: (e: Error) => toast.error(e.message ?? "Could not generate plan"),
  });

  const plan = planQ.data;
  const eventDay = eventDate ? parseISO(eventDate) : null;

  if (planQ.isLoading) return <BentoCard className="p-5"><p className="text-sm text-muted-foreground">Loading plan…</p></BentoCard>;

  if (!plan) {
    return (
      <BentoCard gradient="sunset" className="relative overflow-hidden p-5">
        <GradientOrb color="primary" className="-top-12 -right-12 h-40 w-40" />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-semibold">AI Plan & Run of Show</h3>
          </div>
          <p className="text-sm text-muted-foreground">Turn your brief into a prioritized task list, a day-of run of show, and a supplier shortlist in one click.</p>
          <Button onClick={() => genMut.mutate()} disabled={genMut.isPending} className="bg-gradient-sunset text-primary-foreground">
            {genMut.isPending ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="mr-1 h-4 w-4" /> Generate plan</>}
          </Button>
        </div>
      </BentoCard>
    );
  }

  return (
    <div className="space-y-3">
      <BentoCard className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-display text-base font-semibold">AI Plan</h3>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{plan.summary}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => genMut.mutate()} disabled={genMut.isPending}>
            {genMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate"}
          </Button>
        </div>
      </BentoCard>

      <div className="grid gap-3 md:grid-cols-2">
        <BentoCard className="p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <ListChecks className="h-4 w-4 text-primary" />
            <h4 className="font-display text-sm font-semibold">Tasks</h4>
          </div>
          <ul className="space-y-2">
            {plan.tasks.map((t, i) => {
              const due = eventDay ? addDays(eventDay, -t.due_offset_days) : null;
              return (
                <li key={i} className="flex items-start justify-between gap-2 rounded-lg border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <div className="min-w-0">
                    <div className="font-medium leading-tight">{t.title}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {due ? format(due, "MMM d") : `${t.due_offset_days}d before`} · {t.owner}
                    </div>
                  </div>
                  <Badge variant={priorityVariant[t.priority]} className="shrink-0 text-[10px] capitalize">{t.priority}</Badge>
                </li>
              );
            })}
          </ul>
        </BentoCard>

        <BentoCard className="p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <h4 className="font-display text-sm font-semibold">Run of Show</h4>
          </div>
          <ol className="space-y-2">
            {plan.timeline.map((t, i) => (
              <li key={i} className="grid grid-cols-[56px_1fr] gap-2 text-xs">
                <span className="font-mono tabular-nums text-primary">{t.time}</span>
                <div>
                  <div className="font-medium">{t.title}</div>
                  {t.detail && <div className="text-[10px] text-muted-foreground">{t.detail}</div>}
                </div>
              </li>
            ))}
          </ol>
        </BentoCard>
      </div>

      {plan.shortlist?.length > 0 && (
        <BentoCard className="p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="font-display text-sm font-semibold">Suggested supplier shortlist</h4>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {plan.shortlist.map((s, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-muted/30 p-2.5 text-xs">
                <div className="font-medium capitalize">{s.category}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{s.reason}</div>
              </div>
            ))}
          </div>
        </BentoCard>
      )}
    </div>
  );
};
