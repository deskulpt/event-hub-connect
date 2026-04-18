import { FileText } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Invoices() {
  return (
    <PlaceholderShell
      title='Invoices'
      subtitle='Draft, send, and track invoices through paid and overdue states.'
      ctaLabel='Create invoice'
      emptyTitle='No invoices yet'
      emptyDesc='Create your first invoice from a booking or quote.'
      icon={FileText}
    />
  );
}
