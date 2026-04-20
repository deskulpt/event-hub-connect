import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BentoCardProps {
  children?: ReactNode;
  className?: string;
  gradient?: "sunset" | "aurora" | "ocean" | "mint" | "none";
  glow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const BentoCard = ({
  children,
  className,
  gradient = "none",
  glow = false,
  interactive = false,
  onClick,
}: BentoCardProps) => {
  const gradMap: Record<string, string> = {
    sunset: "before:bg-gradient-sunset",
    aurora: "before:bg-gradient-aurora",
    ocean: "before:bg-gradient-ocean",
    mint: "before:bg-gradient-mint",
    none: "",
  };
  return (
    <div
      onClick={onClick}
      className={cn(
        "bento group relative",
        gradient !== "none" &&
          "before:absolute before:inset-0 before:opacity-[0.06] before:transition-opacity before:duration-500 group-hover:before:opacity-[0.12]",
        gradMap[gradient],
        glow && "hover:shadow-glow",
        interactive && "cursor-pointer",
        className,
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
};

interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  gradient?: "sunset" | "aurora" | "ocean" | "mint" | "none";
  onClick?: () => void;
  className?: string;
}

export const StatTile = ({ label, value, hint, icon: Icon, trend, gradient = "none", onClick, className }: StatTileProps) => (
  <BentoCard gradient={gradient} interactive={!!onClick} onClick={onClick} className={cn("p-5", className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-display text-3xl font-semibold leading-none tab-num">{value}</p>
      </div>
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-sunset/10 text-primary ring-1 ring-primary/20">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
    <div className="mt-3 flex items-center justify-between gap-2">
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {trend && (
        <span className={cn("text-[11px] font-mono font-medium", trend.positive ? "text-success" : "text-destructive")}>
          {trend.value}
        </span>
      )}
    </div>
  </BentoCard>
);

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => (
  <div className={cn("grid auto-rows-[minmax(0,auto)] gap-4", className)}>{children}</div>
);

export const GradientOrb = ({
  color = "primary",
  className,
}: {
  color?: "primary" | "accent" | "tertiary" | "secondary";
  className?: string;
}) => {
  const map: Record<string, string> = {
    primary: "bg-primary/30",
    accent: "bg-accent/30",
    tertiary: "bg-tertiary/30",
    secondary: "bg-secondary/30",
  };
  return <div aria-hidden className={cn("orb animate-orb-drift", map[color], className)} />;
};
