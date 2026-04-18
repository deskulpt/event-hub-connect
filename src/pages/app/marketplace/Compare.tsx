import { GitCompare } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Compare() {
  return (
    <PlaceholderShell
      title='Compare'
      subtitle='Side-by-side comparison of price, fit, capacity, response time, trust, and policies.'
      ctaLabel='Select top choices'
      emptyTitle='Add items to compare'
      emptyDesc='Save venues or pros from the marketplace and compare them here.'
      icon={GitCompare}
    />
  );
}
