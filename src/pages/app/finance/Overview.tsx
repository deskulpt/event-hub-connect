import { Wallet } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Overview() {
  return (
    <PlaceholderShell
      title='Finance overview'
      subtitle='Revenue, costs, margin, due payments, and overdue items at a glance.'
      ctaLabel='Reconcile finance items'
      emptyTitle='Nothing to reconcile'
      emptyDesc='Add transactions, invoices, and receipts to see your financial snapshot.'
      icon={Wallet}
    />
  );
}
