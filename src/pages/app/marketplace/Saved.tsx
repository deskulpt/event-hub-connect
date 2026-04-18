import { Bookmark } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Saved() {
  return (
    <PlaceholderShell
      title='Saved'
      subtitle="Everything you've saved across the marketplace."
      ctaLabel='Start planning from results'
      emptyTitle='Nothing saved yet'
      emptyDesc='Tap the bookmark on any listing to save it for later comparison.'
      icon={Bookmark}
    />
  );
}
