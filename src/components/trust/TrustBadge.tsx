import { BadgeCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VerificationState } from "@/types/community";
import { cn } from "@/lib/utils";

const meta: Record<
  VerificationState,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    className: "border-success/40 bg-success/10 text-success",
  },
  pending: {
    label: "Pending review",
    icon: BadgeCheck,
    className: "border-accent/40 bg-accent/10 text-foreground",
  },
  rejected: {
    label: "Not verified",
    icon: ShieldAlert,
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  unverified: {
    label: "Unverified",
    icon: ShieldAlert,
    className: "border-border/60 text-muted-foreground",
  },
};

export const TrustBadge = ({
  state = "unverified",
  className,
}: {
  state?: VerificationState | null;
  className?: string;
}) => {
  const resolved = meta[state ?? "unverified"] ?? meta.unverified;
  const Icon = resolved.icon;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 rounded-full text-[10px]", resolved.className, className)}
    >
      <Icon className="h-3 w-3" />
      {resolved.label}
    </Badge>
  );
};
