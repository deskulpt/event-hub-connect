import { MessageSquare } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Conversations() {
  return (
    <PlaceholderShell
      title='Conversations'
      subtitle='Omnichannel thread view: messages, notes, emails, AI call summaries.'
      ctaLabel='Send message'
      emptyTitle='No conversations yet'
      emptyDesc='Conversations will appear here once you start messaging vendors and clients.'
      icon={MessageSquare}
    />
  );
}
