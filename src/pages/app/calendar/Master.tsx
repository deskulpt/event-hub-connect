import { Calendar } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Master() {
  return (
    <PlaceholderShell
      title='Master Calendar'
      subtitle='See and manage every date-bound commitment in one place.'
      ctaLabel='Add hold or schedule item'
      secondaryCtaLabel='Sync external calendar'
      emptyTitle='Calendar is empty'
      emptyDesc='Add events, holds, calls, or payment milestones to populate your calendar.'
      icon={Calendar}
    />
  );
}
