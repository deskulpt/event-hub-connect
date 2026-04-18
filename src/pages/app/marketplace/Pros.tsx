import { Briefcase } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Pros() {
  return (
    <PlaceholderShell
      title='Pros'
      subtitle='Find independent professionals — chefs, photographers, DJs, planners.'
      ctaLabel='Start planning from results'
      emptyTitle='No pros yet'
      emptyDesc='Search by skill, city, and availability to shortlist top-fit pros.'
      icon={Briefcase}
    />
  );
}
