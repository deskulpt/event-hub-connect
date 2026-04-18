import { FileBadge } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Policies() {
  return (
    <PlaceholderShell
      title='Policies'
      subtitle='Cancellation, refund, and platform policies.'
      ctaLabel='Update policies'
      emptyTitle='Default policies in effect'
      emptyDesc='Customize your cancellation and refund policies for bookings.'
      icon={FileBadge}
    />
  );
}
