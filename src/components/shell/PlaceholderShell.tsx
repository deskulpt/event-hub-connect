import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shell/PageHeader";
import { ActionStrip } from "@/components/shell/ActionStrip";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { FooterUtility } from "@/components/shell/FooterUtility";
import { LucideIcon, ArrowRight } from "lucide-react";

interface ShellProps {
  title: string;
  subtitle: string;
  status?: string;
  ctaLabel: string;
  secondaryCtaLabel?: string;
  emptyTitle: string;
  emptyDesc: string;
  icon?: LucideIcon;
  rightRail?: ReactNode;
  filters?: ReactNode;
  children?: ReactNode;
}

export const PlaceholderShell = ({
  title, subtitle, status, ctaLabel, secondaryCtaLabel,
  emptyTitle, emptyDesc, icon: Icon, rightRail, filters, children,
}: ShellProps) => (
  <PageLayout
    rightRail={rightRail}
    footer={<FooterUtility lastSynced="just now" />}
  >
    <PageHeader
      title={title}
      subtitle={subtitle}
      status={status}
      primaryCta={<Button size="sm">{ctaLabel}<ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>}
      secondaryCta={secondaryCtaLabel ? <Button size="sm" variant="outline">{secondaryCtaLabel}</Button> : undefined}
    />
    <ActionStrip filters={filters} />
    {children ?? (
      <EmptyState
        icon={Icon ? <Icon className="h-5 w-5 text-primary" /> : undefined}
        title={emptyTitle}
        description={emptyDesc}
        action={<Button size="sm">{ctaLabel}</Button>}
      />
    )}
  </PageLayout>
);
