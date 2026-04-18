import { CalendarCheck } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function EventDetail() {
  return (
    <PlaceholderShell
      title='Event detail'
      subtitle='Move this event from current stage to confirmed execution.'
      status='Draft'
      ctaLabel='Advance to next stage'
      secondaryCtaLabel='Edit brief'
      emptyTitle='Event not found'
      emptyDesc='Pick an event from All Events to see its full plan, vendors, and tasks.'
      icon={CalendarCheck}
    />
  );
}
