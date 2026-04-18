import { CalendarClock } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Scheduling() {
  return (
    <PlaceholderShell
      title='Scheduling Assistant'
      subtitle='Resolve conflicts and find optimal slots with AI-suggested times.'
      ctaLabel='Apply best slot'
      emptyTitle='Nothing to schedule'
      emptyDesc='Add an event or meeting and the assistant will surface optimal slots.'
      icon={CalendarClock}
    />
  );
}
