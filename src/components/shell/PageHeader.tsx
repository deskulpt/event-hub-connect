import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  status?: string;
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
}

export const PageHeader = ({ title, subtitle, status, primaryCta, secondaryCta }: PageHeaderProps) => (
  <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-start md:justify-between">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h1>
        {status && <Badge variant="secondary" className="text-xs">{status}</Badge>}
      </div>
      {subtitle && <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {(primaryCta || secondaryCta) && (
      <div className="flex flex-wrap items-center gap-2">
        {secondaryCta}
        {primaryCta}
      </div>
    )}
  </div>
);
