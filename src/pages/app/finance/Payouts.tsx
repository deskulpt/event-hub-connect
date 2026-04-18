import { Landmark } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Payouts() {
  return (
    <PlaceholderShell
      title='Payouts'
      subtitle='Upcoming and completed payouts, fees, and reserves.'
      ctaLabel='Review payouts'
      emptyTitle='No payouts yet'
      emptyDesc='Once you take payments, payouts will be scheduled here.'
      icon={Landmark}
    />
  );
}
