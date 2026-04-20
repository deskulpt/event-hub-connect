import { Wand2, Sparkles, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    icon: Wand2,
    title: "Tell us your vibe",
    desc: "Type, guests, date, city — done in 30 seconds. We turn it into a structured brief.",
    gradient: "bg-gradient-sunset",
    accent: "from-primary/20",
  },
  {
    icon: Sparkles,
    title: "We match instantly",
    desc: "Fit Score ranks venues and pros against your brief — capacity, vibe, budget, distance.",
    gradient: "bg-gradient-aurora",
    accent: "from-accent/20",
  },
  {
    icon: CalendarCheck,
    title: "You book in clicks",
    desc: "Send inquiries, confirm availability, and lock the date — all in one place.",
    gradient: "bg-gradient-ocean",
    accent: "from-tertiary/20",
  },
];

export const HowItWorks = () => (
  <section className="container px-4 py-16 sm:py-24">
    <div className="mb-10 max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
      <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-secondary sm:text-4xl">
        From spark to standing ovation.
      </h2>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={s.title}
            className="bento group relative p-6 sm:p-7"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`orb -right-10 -top-10 h-40 w-40 ${s.gradient}`} />
            <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${s.gradient} shadow-soft`}>
              <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.2} />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {i + 1}</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-secondary">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
          </div>
        );
      })}
    </div>
  </section>
);
