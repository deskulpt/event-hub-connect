import { Inbox } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Inbox() {
  return (
    <PlaceholderShell
      title='Inbox'
      subtitle='Messages, call summaries, reminders, approvals, and finance alerts in one triage queue.'
      ctaLabel='Process inbox'
      emptyTitle='Inbox zero'
      emptyDesc='New messages and alerts across CRM, calls, and finance will land here.'
      icon={Inbox}
    />
  );
}
