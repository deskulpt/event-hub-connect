import { FilePlus2 } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function EventNew() {
  return (
    <PlaceholderShell
      title='Event brief'
      subtitle='Turn your idea into a complete machine-readable planning brief.'
      status='Step 1 of 4'
      ctaLabel='Generate plan'
      secondaryCtaLabel='Save draft'
      emptyTitle='Tell us about your event'
      emptyDesc="We'll structure the date, headcount, vibe, budget, and constraints into a brief Vibely AI can plan against."
      icon={FilePlus2}
    />
  );
}
