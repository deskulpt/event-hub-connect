import { Building2 } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Venues() {
  return (
    <PlaceholderShell
      title='Venues'
      subtitle='Browse and shortlist venues that match your event brief.'
      ctaLabel='Start planning from results'
      emptyTitle='No venues yet'
      emptyDesc='Filter by city, capacity, and vibe to discover bookable venues.'
      icon={Building2}
    />
  );
}
