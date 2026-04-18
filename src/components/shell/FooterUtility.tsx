import { Download, FileClock, HelpCircle } from "lucide-react";

export const FooterUtility = ({ lastSynced }: { lastSynced?: string }) => (
  <div className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
    <button className="inline-flex items-center gap-1.5 hover:text-foreground"><Download className="h-3.5 w-3.5" /> Export</button>
    <button className="inline-flex items-center gap-1.5 hover:text-foreground"><FileClock className="h-3.5 w-3.5" /> Audit trail</button>
    <button className="inline-flex items-center gap-1.5 hover:text-foreground"><HelpCircle className="h-3.5 w-3.5" /> Help</button>
    {lastSynced && <span className="ml-auto tabular-nums">Last synced {lastSynced}</span>}
  </div>
);
