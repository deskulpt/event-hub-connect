import { MapPin } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function ListingDetail() {
  return (
    <PlaceholderShell
      title='Listing'
      subtitle='Validate fit, capacity, pricing, policies, and bookability.'
      ctaLabel='Check availability'
      secondaryCtaLabel='Save'
      emptyTitle='Listing not found'
      emptyDesc='Pick a venue or pro from the marketplace to view full details.'
      icon={MapPin}
    />
  );
}
