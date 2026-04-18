import { AlertTriangle } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Disputes() {
  return (
    <PlaceholderShell
      title='Disputes'
      subtitle='Open and closed cases with evidence and resolution steps.'
      ctaLabel='Open case'
      emptyTitle='No open disputes'
      emptyDesc='If something goes wrong with a booking or payment, open a case here.'
      icon={AlertTriangle}
    />
  );
}
