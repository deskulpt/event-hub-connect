import { CalendarDays } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function AllEvents() {
  return (
    <PlaceholderShell
      title='All Events'
      subtitle='Find, prioritize, and manage every event across your workspace.'
      ctaLabel='New event'
      emptyTitle='No events yet'
      emptyDesc='Create your first event to start planning, shortlisting, and booking.'
      icon={CalendarDays}
    />
  );
}
