import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventBriefSchema, EVENT_TYPES, type EventBriefInput, type EventRecord } from "@/types/event";
import { Loader2 } from "lucide-react";

interface EventBriefFormProps {
  initial?: EventRecord;
  submitLabel: string;
  onSubmit: (values: EventBriefInput) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
}

export const EventBriefForm = ({ initial, submitLabel, onSubmit, onCancel, submitting }: EventBriefFormProps) => {
  const form = useForm<EventBriefInput>({
    resolver: zodResolver(eventBriefSchema),
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

  const { register, handleSubmit, setValue, watch, formState } = form;
  const eventType = watch("event_type");

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Event name</Label>
          <Input id="title" placeholder="Sara & Jordan's wedding" {...register("title")} />
          {formState.errors.title && <p className="text-xs text-destructive">{formState.errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Event type</Label>
          <Select
            value={eventType ?? undefined}
            onValueChange={(v) => setValue("event_type", v as EventBriefInput["event_type"], { shouldDirty: true })}
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

        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Brooklyn, NY" {...register("city")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest_count">Guest count</Label>
          <Input id="guest_count" type="number" min={1} placeholder="120" {...register("guest_count")} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="budget">Budget (USD)</Label>
          <Input id="budget" type="number" min={0} step="100" placeholder="25000" {...register("budget")} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="vibe">Vibe & aesthetic</Label>
          <Textarea
            id="vibe"
            rows={2}
            placeholder="Warm, candlelit, garden-party feel with live acoustic music."
            {...register("vibe")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dietary_notes">Dietary needs</Label>
          <Textarea id="dietary_notes" rows={2} placeholder="2 vegan, 1 gluten-free, no shellfish" {...register("dietary_notes")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="accessibility_notes">Accessibility</Label>
          <Textarea
            id="accessibility_notes"
            rows={2}
            placeholder="Step-free access, reserved seating near stage"
            {...register("accessibility_notes")}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
