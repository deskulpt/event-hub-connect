import { ShieldCheck, Star, Users, Sparkles } from "lucide-react";

const STATS = [
  { icon: Users, value: "10k+", label: "verified pros" },
  { icon: Star, value: "4.9", label: "avg rating" },
  { icon: ShieldCheck, value: "100%", label: "ID-verified" },
  { icon: Sparkles, value: "60s", label: "to first plan" },
];

export const TrustStrip = () => (
  <section className="border-y border-border/60 bg-muted/30">
    <div className="container px-4 py-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="tab-num font-display text-xl font-semibold leading-none text-secondary">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
