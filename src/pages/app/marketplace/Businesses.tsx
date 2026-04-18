import { Store } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Businesses() {
  return (
    <PlaceholderShell
      title='Businesses'
      subtitle='Discover vendors, suppliers, and multi-location operators.'
      ctaLabel='Start planning from results'
      emptyTitle='No businesses yet'
      emptyDesc='Find catering companies, rental suppliers, and operators by city and category.'
      icon={Store}
    />
  );
}
