import { ShieldCheck } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Insurance() {
  return (
    <PlaceholderShell
      title='Insurance'
      subtitle='Turn uninsured suppliers into compliant bookable providers.'
      ctaLabel='Get covered'
      secondaryCtaLabel='Upload policy'
      emptyTitle='No coverage on file'
      emptyDesc='Add an existing policy or get covered with a per-event option in minutes.'
      icon={ShieldCheck}
    />
  );
}
