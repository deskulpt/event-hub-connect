import { ArrowLeftRight } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Transactions() {
  return (
    <PlaceholderShell
      title='Transactions'
      subtitle='Payment history, refunds, escrow and deposit records.'
      ctaLabel='Record transaction'
      emptyTitle='No transactions yet'
      emptyDesc='Transactions will appear as bookings, payouts, and refunds occur.'
      icon={ArrowLeftRight}
    />
  );
}
