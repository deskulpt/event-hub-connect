import { BookmarkCheck } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Bookings() {
  return (
    <PlaceholderShell
      title='Bookings'
      subtitle='Convert accepted offers into operational bookings with deposits and contracts.'
      ctaLabel='Confirm booking'
      emptyTitle='No bookings yet'
      emptyDesc='When a supplier accepts your inquiry, you can convert it into a booking here.'
      icon={BookmarkCheck}
    />
  );
}
