import { Compass } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Discover() {
  return (
    <PlaceholderShell
      title='Discover'
      subtitle='Search high-fit venues and pros by event brief, city, date, vibe, and budget.'
      ctaLabel='Start planning from results'
      emptyTitle='Search to discover'
      emptyDesc="Try a city, vibe, or category. We'll rank by fit, capacity confidence, and response likelihood."
      icon={Compass}
    />
  );
}
