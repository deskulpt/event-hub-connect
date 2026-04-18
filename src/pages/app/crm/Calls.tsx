import { PhoneCall } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Calls() {
  return (
    <PlaceholderShell
      title='AI Calls'
      subtitle='Confirm availability and reservation details without manual chasing.'
      status='Idle'
      ctaLabel='Start AI confirmation calls'
      secondaryCtaLabel='Configure script'
      emptyTitle='Call queue is empty'
      emptyDesc='Add suppliers to the call queue to launch AI-powered confirmation calls.'
      icon={PhoneCall}
    />
  );
}
