import { Link } from "react-router-dom";
import { Building2, ChefHat, Music, Camera, Disc3, ClipboardList, ArrowUpRight } from "lucide-react";
import venuesImg from "@/assets/tile-venues.jpg";
import chefsImg from "@/assets/tile-chefs.jpg";
import artistsImg from "@/assets/tile-artists.jpg";
import photographersImg from "@/assets/tile-photographers.jpg";
import djsImg from "@/assets/tile-djs.jpg";
import plannersImg from "@/assets/tile-planners.jpg";

const TILES = [
  { title: "Venues", desc: "Cafes, lofts, gardens, ballrooms.", icon: Building2, img: venuesImg, to: "/auth?mode=signup&next=/app/marketplace/venues", span: "col-span-2 row-span-2" },
  { title: "Chefs", desc: "Private dinners & catering.", icon: ChefHat, img: chefsImg, to: "/auth?mode=signup&next=/app/marketplace/pros", span: "" },
  { title: "Artists", desc: "Live music, painters, performers.", icon: Music, img: artistsImg, to: "/auth?mode=signup&next=/app/marketplace/pros", span: "" },
  { title: "Photographers", desc: "Capture every moment.", icon: Camera, img: photographersImg, to: "/auth?mode=signup&next=/app/marketplace/pros", span: "" },
  { title: "DJs", desc: "Set the mood, all night.", icon: Disc3, img: djsImg, to: "/auth?mode=signup&next=/app/marketplace/pros", span: "" },
  { title: "Planners", desc: "End-to-end orchestration.", icon: ClipboardList, img: plannersImg, to: "/auth?mode=signup&next=/app/marketplace/pros", span: "col-span-2" },
];

export const CategoryBento = () => (
  <section className="container px-4 py-16 sm:py-20">
    <div className="mb-8 max-w-xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Marketplace</p>
      <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-secondary sm:text-4xl">
        Whatever you're hosting.
      </h2>
    </div>

    <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
      {TILES.map((t) => {
        const Icon = t.icon;
        return (
          <Link
            key={t.title}
            to={t.to}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl p-5 shadow-soft ${t.span}`}
          >
            <img
              src={t.img}
              alt={`${t.title} for events`}
              loading="lazy"
              width={1024}
              height={1024}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-scrim/90 via-scrim/40 to-scrim/10" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-on-scrim/30 bg-on-scrim/15 backdrop-blur-md">
              <Icon className="h-5 w-5 text-on-scrim" strokeWidth={2.2} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-on-scrim sm:text-xl">{t.title}</h3>
                <ArrowUpRight className="h-4 w-4 text-on-scrim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1 text-xs text-on-scrim/85 sm:text-sm">{t.desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
  </section>
);
