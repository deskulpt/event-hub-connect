import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ActionStripProps {
  searchPlaceholder?: string;
  filters?: ReactNode;
  right?: ReactNode;
}

export const ActionStrip = ({ searchPlaceholder = "Search…", filters, right }: ActionStripProps) => (
  <div className="flex flex-wrap items-center gap-2 py-3">
    <div className="relative min-w-[220px] flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder={searchPlaceholder} className="h-9 pl-9" />
    </div>
    {filters}
    <div className="ml-auto flex items-center gap-2">{right}</div>
  </div>
);
