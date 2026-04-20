import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  status?: string;
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
  eyebrow?: string;
}

export const PageHeader = ({ title, subtitle, status, primaryCta, secondaryCta, eyebrow }: PageHeaderProps) => (
  <div className="relative flex flex-col gap-4 pb-5 md:flex-row md:items-end md:justify-between animate-fade-up">
    <div className="space-y-1.5">
      {(eyebrow || status) && (
        <div className="flex items-center gap-2">
          {eyebrow && (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{eyebrow}</span>
          )}
          {status && (
            <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 px-2 py-0 text-[10px] font-medium uppercase tracking-wider text-primary">
              {status}
            </Badge>
          )}
        </div>
      )}
      <h1 className="font-display text-xl font-semibold tracking-tight text-foreground md:text-[1.65rem]">
        {title}
      </h1>
      {subtitle && <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {(primaryCta || secondaryCta) && (
      <div className="flex flex-wrap items-center gap-2">
        {secondaryCta}
        {primaryCta}
      </div>
    )}
    <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  </div>
);
