import { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { GradientOrb } from "./Bento";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] border border-dashed border-border/70 bg-card/50 px-6 py-20 text-center backdrop-blur">
    <GradientOrb color="primary" className="-top-20 left-1/2 h-56 w-56 -translate-x-1/2" />
    <GradientOrb color="accent" className="-bottom-16 right-10 h-40 w-40" />
    <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-sunset shadow-glow">
      {icon ?? <Sparkles className="h-6 w-6 text-primary-foreground" />}
    </div>
    <h3 className="relative font-display text-base font-semibold text-foreground">{title}</h3>
    {description && <p className="relative mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>}
    {action && <div className="relative mt-6">{action}</div>}
  </div>
);
