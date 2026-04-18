import { Star } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Reviews() {
  return (
    <PlaceholderShell
      title='Reviews'
      subtitle='Manage ratings, review trends, and flagged content.'
      ctaLabel='Request review'
      emptyTitle='No reviews yet'
      emptyDesc='Once events complete, you can request reviews from clients and vendors.'
      icon={Star}
    />
  );
}
