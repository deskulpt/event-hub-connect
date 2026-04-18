import { ListChecks } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Tasks() {
  return (
    <PlaceholderShell
      title='Tasks'
      subtitle='Track tasks across events, vendors, and bookings.'
      ctaLabel='Add task'
      emptyTitle='No tasks yet'
      emptyDesc='Tasks added from event run-of-show and bookings will appear here.'
      icon={ListChecks}
    />
  );
}
