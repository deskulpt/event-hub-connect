import { Send } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Inquiries() {
  return (
    <PlaceholderShell
      title='Inquiries'
      subtitle='Turn shortlists into active supplier responses with batched outreach and reminders.'
      ctaLabel='Send inquiry batch'
      secondaryCtaLabel='New inquiry'
      emptyTitle='No inquiries yet'
      emptyDesc='Pick suppliers from your shortlist and send inquiries in one batch.'
      icon={Send}
    />
  );
}
