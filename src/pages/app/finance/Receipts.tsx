import { Receipt } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Receipts() {
  return (
    <PlaceholderShell
      title='Receipts'
      subtitle='Turn spending evidence into clean books with OCR and event mapping.'
      ctaLabel='Upload receipt'
      emptyTitle='No receipts yet'
      emptyDesc="Snap a photo or upload a receipt — we'll extract the data and map it to an event."
      icon={Receipt}
    />
  );
}
