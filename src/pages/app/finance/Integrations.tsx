import { Plug } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Integrations() {
  return (
    <PlaceholderShell
      title='Integrations'
      subtitle='Connect QuickBooks, Xero, and other accounting apps with mapping rules and sync logs.'
      ctaLabel='Connect accounting app'
      emptyTitle='No integrations connected'
      emptyDesc='Connect your accounting platform to eliminate double entry.'
      icon={Plug}
    />
  );
}
