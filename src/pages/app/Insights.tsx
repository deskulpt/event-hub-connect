import { BarChart3 } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Insights() {
  return (
    <PlaceholderShell
      title='Insights'
      subtitle='Funnel analysis, supplier performance, capacity trends, and revenue insights.'
      ctaLabel='View recommendations'
      emptyTitle='Insights coming online'
      emptyDesc="As your event volume grows, we'll surface conversion and supplier performance insights."
      icon={BarChart3}
    />
  );
}
