import { Users } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Contacts() {
  return (
    <PlaceholderShell
      title='Contacts'
      subtitle='All people and businesses you work with — with event history and trust snapshots.'
      ctaLabel='Add contact'
      emptyTitle='No contacts yet'
      emptyDesc='Add a contact manually or import from past inquiries.'
      icon={Users}
    />
  );
}
