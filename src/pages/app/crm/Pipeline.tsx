import { KanbanSquare } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Pipeline() {
  return (
    <PlaceholderShell
      title='Pipeline'
      subtitle='Move opportunities from lead to quoted to booked to completed.'
      ctaLabel='Add inquiry'
      emptyTitle='Pipeline is empty'
      emptyDesc='Send your first inquiries from the marketplace to populate this board.'
      icon={KanbanSquare}
    />
  );
}
