import { cn } from "@/lib/utils";

interface FitRingProps {
  score: number;
  size?: number;
  className?: string;
  label?: string;
}

export const FitRing = ({ score, size = 56, className, label = "Fit" }: FitRingProps) => {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = size <= 40 ? 4 : 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const tone =
    clamped >= 75 ? "text-success" : clamped >= 50 ? "text-primary" : clamped >= 25 ? "text-accent" : "text-muted-foreground";
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-muted"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn("transition-[stroke-dashoffset] duration-700", tone)}
          stroke="currentColor"
          fill="transparent"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className={cn("font-display font-semibold tabular-nums", size >= 56 ? "text-base" : "text-xs")}>{clamped}</span>
        {size >= 56 && <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
};
