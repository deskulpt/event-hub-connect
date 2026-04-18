import { Clock } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Availability() {
  return (
    <PlaceholderShell
      title='Availability'
      subtitle='Working hours, blackout dates, and per-room or per-staff capacity.'
      ctaLabel='Update availability'
      emptyTitle='Set your availability'
      emptyDesc='Define when you (or your spaces) can be booked to prevent double-bookings.'
      icon={Clock}
    />
  );
}
