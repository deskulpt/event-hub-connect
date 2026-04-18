import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventBriefSchema, EVENT_TYPES, type EventBriefInput, type EventRecord } from "@/types/event";
import { ArrowLeft, ArrowRight, Check, Loader2, CalendarDays, MapPin, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventBriefFormProps {
  initial?: EventRecord;
  submitLabel: string;
  onSubmit: (values: EventBriefInput) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
}

type StepKey = "basics" | "vibe" | "logistics" | "review";
type FieldName = keyof EventBriefInput;

const STEPS: Array<{ key: StepKey; label: string; fields: FieldName[] }> = [
  { key: "basics", label: "Basics", fields: ["title", "event_type", "event_date", "city"] },
  { key: "vibe", label: "Vibe", fields: ["vibe", "guest_count"] },
  { key: "logistics", label: "Logistics", fields: ["budget", "dietary_notes", "accessibility_notes"] },
  { key: "review", label: "Review", fields: [] },
];

export const EventBriefForm = ({ initial, submitLabel, onSubmit, onCancel, submitting }: EventBriefFormProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const form = useForm<EventBriefInput>({
    resolver: zodResolver(eventBriefSchema),
    mode: "onBlur",
    defaultValues: {
      title: initial?.title ?? "",
      event_type: (initial?.event_type as EventBriefInput["event_type"]) ?? undefined,
      event_date: initial?.event_date ?? "",
      city: initial?.city ?? "",
      guest_count: (initial?.guest_count ?? "") as unknown as number,
      budget: ((initial?.budget_cents ?? 0) / 100 || "") as unknown as number,
      vibe: initial?.vibe ?? "",
      dietary_notes: initial?.dietary_notes ?? "",
      accessibility_notes: initial?.accessibility_notes ?? "",
      status: initial?.status ?? "draft",
    },
  });

  const { register, handleSubmit, setValue, watch, trigger, formState, getValues } = form;
  const values = watch();

  const goNext = async () => {
    const ok = step.fields.length === 0 ? true : await trigger(step.fields);
    if (ok) setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {STEPS.map((s, idx) => {
              const isActive = idx === stepIndex;
              const isDone = idx < stepIndex;
              return (
                <button
                  type="button"
                  key={s.key}
                  onClick={() => idx <= stepIndex && setStepIndex(idx)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isDone && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    !isActive && !isDone && "text-muted-foreground",
                  )}
                  disabled={idx > stepIndex}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                      isActive && "border-primary-foreground/40",
                      isDone && "border-secondary-foreground/30 bg-background/50",
                      !isActive && !isDone && "border-border",
                    )}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground">Step {stepIndex + 1} of {STEPS.length}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {step.key === "basics" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Event name</Label>
            <Input id="title" placeholder="Sara & Jordan's wedding" {...register("title")} />
            {formState.errors.title && <p className="text-xs text-destructive">{formState.errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Event type</Label>
            <Select
              value={values.event_type ?? undefined}
              onValueChange={(v) => setValue("event_type", v as EventBriefInput["event_type"], { shouldDirty: true, shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Pick a type" /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event_date">Date</Label>
            <Input id="event_date" type="date" {...register("event_date")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Brooklyn, NY" {...register("city")} />
          </div>
        </div>
      )}

      {step.key === "vibe" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="vibe">Vibe & aesthetic</Label>
            <Textarea
              id="vibe"
              rows={4}
              placeholder="Warm, candlelit, garden-party feel with live acoustic music."
              {...register("vibe")}
            />
            {formState.errors.vibe && <p className="text-xs text-destructive">{formState.errors.vibe.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guest_count">Guest count</Label>
            <Input id="guest_count" type="number" min={1} max={100000} placeholder="120" {...register("guest_count")} />
            {formState.errors.guest_count && <p className="text-xs text-destructive">{formState.errors.guest_count.message}</p>}
          </div>
        </div>
      )}

      {step.key === "logistics" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="budget">Budget (USD)</Label>
            <Input id="budget" type="number" min={0} step="100" placeholder="25000" {...register("budget")} />
            {formState.errors.budget && <p className="text-xs text-destructive">{formState.errors.budget.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dietary_notes">Dietary needs</Label>
            <Textarea id="dietary_notes" rows={3} placeholder="2 vegan, 1 gluten-free, no shellfish" {...register("dietary_notes")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accessibility_notes">Accessibility</Label>
            <Textarea
              id="accessibility_notes"
              rows={3}
              placeholder="Step-free access, reserved seating near stage"
              {...register("accessibility_notes")}
            />
          </div>
        </div>
      )}

      {step.key === "review" && (
        <ReviewStep values={getValues()} onJumpTo={(i) => setStepIndex(i)} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
        <div>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {stepIndex > 0 && (
            <Button type="button" variant="outline" onClick={goBack} disabled={submitting}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          )}
          {!isLast && (
            <Button type="button" onClick={goNext}>
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
          {isLast && (
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

const ReviewStep = ({ values, onJumpTo }: { values: EventBriefInput; onJumpTo: (i: number) => void }) => {
  const budget = values.budget ? `$${Number(values.budget).toLocaleString()}` : "—";
  const rows: Array<{ icon: typeof CalendarDays; label: string; value: string; stepIndex: number }> = [
    { icon: CalendarDays, label: "Name", value: values.title || "—", stepIndex: 0 },
    { icon: CalendarDays, label: "Type", value: values.event_type ?? "—", stepIndex: 0 },
    { icon: CalendarDays, label: "Date", value: values.event_date ? String(values.event_date) : "TBD", stepIndex: 0 },
    { icon: MapPin, label: "City", value: values.city ? String(values.city) : "—", stepIndex: 0 },
    { icon: Users, label: "Guests", value: values.guest_count ? String(values.guest_count) : "—", stepIndex: 1 },
    { icon: Wallet, label: "Budget", value: budget, stepIndex: 2 },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Review your brief</h3>
          <Badge variant="outline">Almost there</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => onJumpTo(r.stepIndex)}
              className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <r.icon className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{r.label}</div>
                  <div className="text-sm font-medium capitalize">{r.value}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {values.vibe && (
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">Vibe</div>
          <p className="text-sm">{values.vibe as string}</p>
        </div>
      )}
      {values.dietary_notes && (
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">Dietary</div>
          <p className="text-sm">{values.dietary_notes as string}</p>
        </div>
      )}
      {values.accessibility_notes && (
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">Accessibility</div>
          <p className="text-sm">{values.accessibility_notes as string}</p>
        </div>
      )}
    </div>
  );
};
