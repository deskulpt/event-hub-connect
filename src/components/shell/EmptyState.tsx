import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
      {icon ?? <Sparkles className="h-5 w-5 text-primary" />}
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
