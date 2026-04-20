import { Link } from "react-router-dom";
import { Building2, ChefHat, Music, Camera, Disc3, ClipboardList, ArrowUpRight } from "lucide-react";

const TILES = [
  { title: "Venues", desc: "Cafes, lofts, gardens, ballrooms.", icon: Building2, gradient: "bg-gradient-aurora", to: "/auth?mode=signup&next=/app/marketplace/venues", span: "md:col-span-2 md:row-span-2" },
  { title: "Chefs", desc: "Private dinners & catering.", icon: ChefHat, gradient: "bg-gradient-sunset", to: "/auth?mode=signup&next=/app/marketplace/pros", span: "" },
  { title: "Artists", desc: "Live music, painters, performers.", icon: Music, gradient: "bg-gradient-ocean", to: "/auth?mode=signup&next=/app/marketplace/pros", span: "" },
  { title: "Photographers", desc: "Capture every moment.", icon: Camera, gradient: "bg-gradient-mint", to: "/auth?mode=signup&next=/app/marketplace/pros", span: "" },
  { title: "DJs", desc: "Set the mood, all night.", icon: Disc3, gradient: "bg-gradient-aurora", to: "/auth?mode=signup&next=/app/marketplace/pros", span: "" },
  { title: "Planners", desc: "End-to-end orchestration.", icon: ClipboardList, gradient: "bg-gradient-sunset", to: "/auth?mode=signup&next=/app/marketplace/pros", span: "md:col-span-2" },
];

export const CategoryBento = () => (
  <section className="container px-4 py-16 sm:py-20">
    <div className="mb-8 flex items-end justify-between gap-4">
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Marketplace</p>
        <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-secondary sm:text-4xl">
          Whatever you're hosting.
        </h2>
      </div>
    </div>

    <div className="grid auto-rows-[160px] grid-cols-2 gap-4 md:grid-cols-4">
      {TILES.map((t) => {
        const Icon = t.icon;
        return (
          <Link
            key={t.title}
            to={t.to}
            className={`bento group relative flex flex-col justify-between p-5 ${t.span}`}
          >
            <div className={`orb -right-12 -top-12 h-44 w-44 ${t.gradient}`} />
            <div className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${t.gradient} shadow-soft`}>
              <Icon className="h-5 w-5 text-primary-foreground" strokeWidth={2.2} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-secondary">{t.title}</h3>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
  </section>
);
