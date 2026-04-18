import { BadgeCheck } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Verification() {
  return (
    <PlaceholderShell
      title='Verification Center'
      subtitle='Become a trusted, bookable participant on the platform.'
      status='Pending'
      ctaLabel='Complete verification'
      emptyTitle='Verification not started'
      emptyDesc='Complete identity and business verification to unlock bookings and badges.'
      icon={BadgeCheck}
    />
  );
}
