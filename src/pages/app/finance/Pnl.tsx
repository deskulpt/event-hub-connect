import { TrendingUp } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Pnl() {
  return (
    <PlaceholderShell
      title='Event P&L'
      subtitle='Revenue versus cost per event, with margin by supplier and category.'
      ctaLabel='Export P&L'
      emptyTitle='No P&L yet'
      emptyDesc='Once events have transactions attached, P&L will be calculated automatically.'
      icon={TrendingUp}
    />
  );
}
